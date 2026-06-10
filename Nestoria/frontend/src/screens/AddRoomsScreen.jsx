import { Fragment, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Photo from '../components/Photo.jsx';
import Icon from '../components/Icon.jsx';
import HotelMap from '../components/HotelMap.jsx';
import { hotelsAPI, roomsAPI, hostAPI, uploadAPI, profileAPI } from '../lib/api.js';
import { hotelBasicsSchema, hotelAddressSchema, roomSchema } from '../lib/schemas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

const AMENITIES = [
  { key: 'wifi',      label: 'Wi-Fi tốc độ cao', icon: 'wifi' },
  { key: 'pool',      label: 'Hồ bơi nước mặn',  icon: 'pool' },
  { key: 'spa',       label: 'Spa & chăm sóc sức khỏe', icon: 'spa' },
  { key: 'utensils',  label: 'Nhà hàng & quán bar', icon: 'utensils' },
  { key: 'ac',        label: 'Điều hòa không khí', icon: 'ac' },
  { key: 'car',       label: 'Đưa đón sân bay', icon: 'car' },
  { key: 'concierge', label: 'Lễ tân 24/7',   icon: 'concierge' },
  { key: 'coffee',    label: 'Cà phê cả ngày',   icon: 'coffee' },
  { key: 'tv',        label: 'Smart TV',         icon: 'tv' },
  { key: 'gym',       label: 'Phòng gym',        icon: 'dumbbell' },
];

const HUES = ['sand','ocean','forest','dusk','warm','cool'];

const HUE_COLORS = {
  sand:   '#d4b483',
  ocean:  '#5e8ba6',
  forest: '#6e8b6c',
  dusk:   '#a87b8f',
  warm:   '#c97d5d',
  cool:   '#7a96a8',
};

export default function AddRoomsScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const { user } = useAuth();
  const editingHotelId = Number(params.get('hotel')) || null;

  // Pull fresh profile so onboarding flag reflects DB state, not just auth context.
  const profileQ = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.get().then((d) => d.user),
  });
  const onboarded = profileQ.data
    ? Boolean(profileQ.data.business_name && profileQ.data.phone)
    : user?.onboarded;

  const propertiesQ = useQuery({ queryKey: ['host','properties'], queryFn: () => hostAPI.properties().then((d) => d.properties), enabled: !!editingHotelId });
  const hotelForEdit = propertiesQ.data?.find((p) => p.id === editingHotelId);

  const [step, setStep] = useState(editingHotelId ? 2 : 0);
  const [createdHotel, setCreatedHotel] = useState(editingHotelId ? { id: editingHotelId, slug: hotelForEdit?.slug } : null);
  const [basics, setBasics] = useState(null);
  const [address, setAddress] = useState(null);
  usePageTitle('Thêm nhà cho thuê');

  const basicsForm = useForm({
    resolver: zodResolver(hotelBasicsSchema),
    defaultValues: { name: '', slug: '', region: '', city: '', description: '', hue: 'sand' },
  });
  const addressForm = useForm({
    resolver: zodResolver(hotelAddressSchema),
    defaultValues: { address: '', phone: '', checkin_time: '15:00', checkout_time: '11:00', amenities: ['wifi','spa','utensils','ac'], latitude: undefined, longitude: undefined },
  });

  const createHotelMut = useMutation({
    mutationFn: (body) => hotelsAPI.create(body),
    onSuccess: (d) => { setCreatedHotel(d.hotel); qc.invalidateQueries({ queryKey: ['host','properties'] }); setStep(2); },
  });

  // ----- Room editor state -----
  const [rooms, setRooms] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  const roomForm = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: '', type: 'Heritage Suite', view: '', beds: 'King bed', size_sqm: 32, price_per_night: 10000, hue: 'sand', special_amenities: '' },
  });

  const createRoomMut = useMutation({
    mutationFn: (body) => roomsAPI.create(body),
    onSuccess: (d) => {
      setRooms((rs) => [...rs, d.room]);
      setEditingIdx(null);
      roomForm.reset();
      qc.invalidateQueries({ queryKey: ['host','properties'] });
    },
  });
  const removeRoomMut = useMutation({
    mutationFn: (id) => roomsAPI.remove(id),
    onSuccess: (_, id) => setRooms((rs) => rs.filter((r) => r.id !== id)),
  });

  const uploadHotelImage = async (file) => {
    setUploadingFor('hotel');
    try {
      const { url } = await uploadAPI.hotelImage(file);
      await hotelsAPI.update(createdHotel.id, { hero_image_url: url });
      qc.invalidateQueries({ queryKey: ['host','properties'] });
    } finally { setUploadingFor(null); }
  };

  const submitBasics = (data) => { setBasics(data); setStep(1); };

  const submitAddress = (data) => {
    setAddress(data);
    createHotelMut.mutate({ ...basics, ...data });
  };

  const submitRoom = (data) => {
    createRoomMut.mutate({ hotel_id: createdHotel.id, ...data });
  };

  const steps = [
    { id: 0, label: 'Thông tin' },
    { id: 1, label: 'Địa chỉ & tiện nghi' },
    { id: 2, label: 'Phòng' },
  ];

  // Gate: hosts must complete their business profile before listing.
  if (user?.role === 'host' && profileQ.isFetched && !onboarded && !editingHotelId) {
    return (
      <div className="container" style={{ padding: '120px 0', textAlign: 'center', maxWidth: 600 }}>
        <div className="eyebrow mb-3">— Một bước đầu tiên</div>
        <h2 className="h-2">Hoàn thiện hồ sơ đối tác</h2>
        <p className="text-muted mt-3">
          Thêm tên doanh nghiệp và số điện thoại trước khi niêm yết chỗ nghỉ. Chỉ mất khoảng một phút.
        </p>
        <button className="btn btn-primary mt-6" onClick={() => navigate('/host/profile')}>
          Mở hồ sơ <Icon name="arrow-right" size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 980 }}>
      <button onClick={() => navigate('/host/dashboard')} className="text-muted mb-4" style={{ fontSize: 13 }}>← Về bảng điều khiển</button>
      <div className="eyebrow mb-3">— {editingHotelId ? `Quản lý · ${hotelForEdit?.name || 'nhà cho thuê'}` : 'Niêm yết nhà cho thuê mới'}</div>
      <h1 className="h-1 mb-6">{editingHotelId ? 'Thêm phòng.' : 'Cùng niêm yết nhà cho thuê của bạn.'}</h1>

      <div className="book-steps">
        {steps.map((s, i) => (
          <Fragment key={s.id}>
            <div className={`book-step ${step === s.id ? 'is-active' : ''} ${step > s.id ? 'is-done' : ''}`}>
              <span className="book-step-num">{step > s.id ? <Icon name="check" size={12} /> : s.id + 1}</span>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <span className="book-step-line" />}
          </Fragment>
        ))}
      </div>

      <div className="card" style={{ padding: 36 }}>
        {step === 0 && (
          <form className="fade-up" onSubmit={basicsForm.handleSubmit(submitBasics)}>
            <h2 className="h-3 mb-4">Kể về nhà cho thuê của bạn</h2>
            <div className="field mb-3">
              <label className="field-label">Tên nhà cho thuê</label>
              <input className="input" placeholder="The Marigold House" {...basicsForm.register('name')} />
              {basicsForm.formState.errors.name && <small style={{ color: 'var(--danger)' }}>{basicsForm.formState.errors.name.message}</small>}
            </div>
            <div className="field mb-3">
              <label className="field-label">Đường dẫn URL</label>
              <input className="input" placeholder="marigold-house" {...basicsForm.register('slug')} />
              {basicsForm.formState.errors.slug && <small style={{ color: 'var(--danger)' }}>{basicsForm.formState.errors.slug.message}</small>}
            </div>
            <div className="form-row-2">
              <div className="field"><label className="field-label">Tỉnh / Thành phố</label>
                <input className="input" placeholder="Thừa Thiên Huế" {...basicsForm.register('region')} />
                {basicsForm.formState.errors.region && <small style={{ color: 'var(--danger)' }}>{basicsForm.formState.errors.region.message}</small>}
              </div>
              <div className="field"><label className="field-label">Thành phố</label>
                <input className="input" placeholder="Huế" {...basicsForm.register('city')} />
                {basicsForm.formState.errors.city && <small style={{ color: 'var(--danger)' }}>{basicsForm.formState.errors.city.message}</small>}
              </div>
            </div>
            <div className="field mt-3 mb-3">
              <label className="field-label">Mô tả ngắn</label>
              <textarea className="input" rows={4} placeholder="Cho người thuê biết điều gì làm nơi này đặc biệt..." {...basicsForm.register('description')} />
              {basicsForm.formState.errors.description && <small style={{ color: 'var(--danger)' }}>{basicsForm.formState.errors.description.message}</small>}
            </div>
            <div className="field mb-4">
              <label className="field-label">Tông màu chủ đạo</label>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {HUES.map((h) => {
                  const selected = basicsForm.watch('hue') === h;
                  return (
                    <button
                      type="button"
                      key={h}
                      className={`chip ${selected ? 'is-active' : ''}`}
                      onClick={() => basicsForm.setValue('hue', h, { shouldValidate: true })}
                    >
                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: HUE_COLORS[h], display: 'inline-block', border: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }} />
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="row mt-8" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-lg">Tiếp tục <Icon name="arrow-right" size={14} /></button>
            </div>
          </form>
        )}

        {step === 1 && (
          <form className="fade-up" onSubmit={addressForm.handleSubmit(submitAddress)}>
            <h2 className="h-3 mb-4">Địa chỉ & tiện nghi</h2>
            <div className="field mb-3">
              <label className="field-label">Địa chỉ</label>
              <textarea className="input" rows={2} placeholder="Số nhà, đường, phường, thành phố" {...addressForm.register('address')} />
              {addressForm.formState.errors.address && <small style={{ color: 'var(--danger)' }}>{addressForm.formState.errors.address.message}</small>}
            </div>
            <div className="field mb-6">
              <label className="field-label">Điện thoại lễ tân</label>
              <input className="input" placeholder="+84 ..." {...addressForm.register('phone')} />
            </div>

            <div className="field mb-6">
              <label className="field-label">Đánh dấu vị trí trên bản đồ</label>
              <p className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}>
                Nhấp vào bản đồ để đặt ghim. Kéo ghim để điều chỉnh.
              </p>
              <HotelMap
                lat={addressForm.watch('latitude')}
                lng={addressForm.watch('longitude')}
                interactive
                height="clamp(260px, 45vh, 380px)"
                onChange={({ lat, lng }) => {
                  addressForm.setValue('latitude', lat, { shouldValidate: true });
                  addressForm.setValue('longitude', lng, { shouldValidate: true });
                }}
              />
              <div className="text-mono mt-2" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                {addressForm.watch('latitude') != null && addressForm.watch('longitude') != null
                  ? `lat ${Number(addressForm.watch('latitude')).toFixed(5)}, lng ${Number(addressForm.watch('longitude')).toFixed(5)}`
                  : 'Chưa đặt ghim'}
              </div>
            </div>

            <div className="eyebrow mb-3">— Tiện nghi</div>
            <div className="amenities-3" style={{ marginBottom: 24 }}>
              {AMENITIES.map((a) => {
                const watched = addressForm.watch('amenities') || [];
                const on = watched.includes(a.key);
                return (
                  <button key={a.key} type="button"
                          onClick={() => addressForm.setValue('amenities', on ? watched.filter((x) => x !== a.key) : [...watched, a.key])}
                          style={{
                            padding: '14px',
                            border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`,
                            background: on ? 'var(--accent-soft)' : 'var(--bg-elev)',
                            color: on ? 'var(--accent)' : 'var(--ink)',
                            borderRadius: 12,
                            display: 'flex', alignItems: 'center', gap: 10,
                            cursor: 'pointer', fontSize: 13, textAlign: 'left',
                            transition: 'all .15s ease',
                          }}>
                    <Icon name={a.icon} size={16} />
                    {a.label}
                  </button>
                );
              })}
            </div>

            {createHotelMut.isError && (
              <p style={{ color: 'var(--danger)', fontSize: 13 }}>{createHotelMut.error?.response?.data?.error || 'Không thể tạo nhà cho thuê'}</p>
            )}

            <div className="row mt-8" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>Quay lại</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={createHotelMut.isPending}>
                {createHotelMut.isPending ? 'Đang tạo…' : 'Tiếp tục'} <Icon name="arrow-right" size={14} />
              </button>
            </div>
          </form>
        )}

        {step === 2 && createdHotel && (
          <div className="fade-up">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <h2 className="h-3">Phòng ({rooms.length})</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setEditingIdx('new')}>
                <Icon name="plus" size={12} /> Thêm phòng
              </button>
            </div>

            {/* Hero upload */}
            <div className="card-flat mb-6" style={{ padding: 16, background: 'var(--bg-inset)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div>
                  <div className="eyebrow mb-2">— Ảnh bìa</div>
                  <span className="text-muted" style={{ fontSize: 13 }}>JPG/PNG/WebP tối đa 5MB</span>
                </div>
                <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                  {uploadingFor === 'hotel' ? 'Đang tải…' : 'Tải lên'}
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                         onChange={(e) => e.target.files?.[0] && uploadHotelImage(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="stack" style={{ '--gap': '12px' }}>
              {rooms.map((r) => (
                <div key={r.id} className="card" style={{ padding: 16, background: 'var(--bg-inset)' }}>
                  <div className="row" style={{ gap: 16 }}>
                    <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <Photo hue={r.hue} src={r.image_url} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18 }}>{r.type}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {[r.view, r.beds, r.size_sqm && `${r.size_sqm} sqm`].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                    <div className="text-mono" style={{ fontSize: 18 }}>₫{Number(r.price_per_night).toLocaleString('vi-VN')}</div>
                    <div className="eyebrow mt-1">/ tháng</div>
                  </div>
                  <button className="stepper-btn" onClick={() => removeRoomMut.mutate(r.id)} aria-label="Xóa phòng">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {editingIdx === 'new' && (
                <form className="card" style={{ padding: 16, background: 'var(--bg-inset)' }}
                      onSubmit={roomForm.handleSubmit(submitRoom)}>
                  <div className="form-row-2">
                    <div className="field"><label className="field-label">Tên phòng</label>
                      <input className="input" placeholder="Suite Cổ điển — Hướng hồ" {...roomForm.register('name')} />
                      {roomForm.formState.errors.name && <small style={{ color: 'var(--danger)' }}>{roomForm.formState.errors.name.message}</small>}
                    </div>
                    <div className="field"><label className="field-label">Loại</label>
                      <input className="input" placeholder="Suite, Cabin, Studio…" {...roomForm.register('type')} />
                      {roomForm.formState.errors.type && <small style={{ color: 'var(--danger)' }}>{roomForm.formState.errors.type.message}</small>}
                    </div>
                  </div>
                  <div className="form-row-3" style={{ marginTop: 12 }}>
                    <div className="field"><label className="field-label">₫ / tháng</label>
                      <input className="input" type="number" {...roomForm.register('price_per_night')} />
                      {roomForm.formState.errors.price_per_night && <small style={{ color: 'var(--danger)' }}>{roomForm.formState.errors.price_per_night.message}</small>}
                    </div>
                    <div className="field"><label className="field-label">Diện tích (m²)</label>
                      <input className="input" type="number" {...roomForm.register('size_sqm')} /></div>
                    <div className="field"><label className="field-label">Tầm nhìn</label>
                      <input className="input" {...roomForm.register('view')} /></div>
                    <div className="field"><label className="field-label">Giường</label>
                      <input className="input" {...roomForm.register('beds')} /></div>
                    <div className="field"><label className="field-label">Tông màu</label>
                      <select className="select" {...roomForm.register('hue')}>
                        {HUES.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select></div>
                  </div>
                  <div className="field mt-3"><label className="field-label">Tiện nghi đặc biệt</label>
                    <input className="input" placeholder="Ban công riêng, Bồn tắm, Vòi sen ngoài trời" {...roomForm.register('special_amenities')} />
                    <small className="text-muted" style={{ fontSize: 11 }}>Phân cách bằng dấu phẩy — riêng cho phòng này.</small>
                    {roomForm.formState.errors.special_amenities && <small style={{ color: 'var(--danger)', display: 'block' }}>{roomForm.formState.errors.special_amenities.message}</small>}
                  </div>
                  {createRoomMut.isError && (
                    <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{createRoomMut.error?.response?.data?.error || 'Thất bại'}</p>
                  )}
                  <div className="row mt-4" style={{ justifyContent: 'flex-end', gap: 8 }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingIdx(null)}>Hủy</button>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={createRoomMut.isPending}>
                      <Icon name="check" size={12} /> {createRoomMut.isPending ? 'Đang lưu…' : 'Lưu phòng'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {rooms.length === 0 && (
              <p className="text-muted mt-6" style={{ fontSize: 13 }}>
                Thêm ít nhất một phòng trước khi xuất bản.
              </p>
            )}

            <div className="row mt-8" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => editingHotelId ? navigate('/host/dashboard') : setStep(1)}>
                {editingHotelId ? 'Hủy' : 'Quay lại'}
              </button>
              <button
                className="btn btn-accent btn-lg"
                disabled={rooms.length === 0}
                title={rooms.length === 0 ? 'Thêm ít nhất một phòng trước khi xuất bản' : undefined}
                onClick={() => navigate('/host/dashboard')}
              >
                <Icon name="check" size={14} /> {editingHotelId ? 'Xong' : 'Xuất bản nhà cho thuê'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
