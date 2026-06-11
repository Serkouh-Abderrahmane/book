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

const ROOM_AMENITIES = [
  { key: 'bed',      label: 'Giường',      icon: 'bed' },
  { key: 'mattress', label: 'Nệm',         icon: 'moon' },
  { key: 'wardrobe', label: 'Tủ quần áo',  icon: 'grid' },
  { key: 'elevator', label: 'Thang máy',   icon: 'arrow-up-right' },
  { key: 'wifi',     label: 'Wifi',        icon: 'wifi' },
  { key: 'ac',       label: 'Máy lạnh',    icon: 'ac' },
  { key: 'kitchen',  label: 'Kệ bếp',      icon: 'utensils' },
  { key: 'hotwater', label: 'Nước nóng',   icon: 'sun' },
  { key: 'fridge',   label: 'Tủ lạnh',     icon: 'coffee' },
  { key: 'loft',     label: 'Gác',         icon: 'home' },
];

const COST_FIELDS = [
  { key: 'electricity_price', label: 'Điện sinh hoạt', unit: 'kWh', placeholder: 'VD: 3.500' },
  { key: 'water_price',       label: 'Nước sinh hoạt', unit: 'ng', placeholder: 'VD: 100' },
  { key: 'management_fee',    label: 'Phí quản lý',    unit: 'ph', placeholder: 'VD: 200' },
  { key: 'parking_fee',       label: 'Giữ xe máy',     unit: 'xe', placeholder: 'VD: 500' },
];

const EQUIPMENT_FIELDS = [
  { key: 'toilet_type',    label: 'Toilet',     options: ['Riêng', 'Chung'] },
  { key: 'hour_rule',      label: 'Giờ giấc',   options: ['Tự do', 'Giờ giấc'] },
  { key: 'washing_machine',label: 'Máy giặt',   options: ['Chung', 'Riêng', 'Không'] },
  { key: 'parking_type',   label: 'Sân xe',     options: ['Chung', 'Riêng', 'Không'] },
];

const FMT = (n) => Number(n).toLocaleString('vi-VN');

function formatCostValue(value, unit) {
  if (value === null || value === undefined || value === '') return '—';
  if (value === 0 || value === '0') return 'Miễn phí';
  const num = Number(value);
  if (!isNaN(num)) {
    if (unit === 'kWh') return `${num}k/kWh`;
    if (unit === 'ng') return `${num}k/ng`;
    if (unit === 'ph') return `${num}k/ph`;
    return `${FMT(num)}₫`;
  }
  return String(value);
}

// Mini live preview of the room as it would appear on DetailScreen
function RoomPreview({ room, previewRoom }) {
  const r = previewRoom || room || {};
  if (!r.type && !r.price_per_night) {
    return (
      <div className="card" style={{ padding: 24, background: 'var(--bg-inset)', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
        <Icon name="eye" size={20} style={{ marginBottom: 8, opacity: 0.4 }} />
        <p>Điền thông tin phòng để xem trước</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 20, background: 'var(--bg-inset)', fontSize: 13 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{r.type}</div>
      {r.price_per_night && <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{FMT(r.price_per_night)}₫ /tháng</div>}
      <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {ROOM_AMENITIES.map((a) => {
          const on = r[`amenity_${a.key}`] || (r.special_amenities && r.special_amenities.toLowerCase().includes(a.key));
          return (
            <span key={a.key} style={{
              padding: '2px 8px', borderRadius: 6, fontSize: 11,
              background: on ? 'var(--accent-soft)' : 'var(--bg-elev)',
              color: on ? 'var(--accent)' : 'var(--ink-3)',
              border: '1px solid var(--line)',
            }}>
              {a.label}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12 }}>
        <div style={{ color: 'var(--ink-3)' }}>Diện tích:</div><div>{r.size_sqm || '—'} m²</div>
        <div style={{ color: 'var(--ink-3)' }}>Giường:</div><div>{r.beds || '—'}</div>
        <div style={{ color: 'var(--ink-3)' }}>Tầm nhìn:</div><div>{r.view || '—'}</div>
      </div>
      {COST_FIELDS.map((c) => {
        const val = r[c.key];
        if (val === undefined || val === null || val === '') return null;
        return (
          <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 2 }}>
            <span style={{ color: 'var(--ink-3)' }}>{c.label}:</span>
            <span>{formatCostValue(val, c.unit)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AddRoomsScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qc = useQueryClient();
  const { user } = useAuth();
  const editingHotelId = Number(params.get('hotel')) || null;

  const profileQ = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileAPI.get().then((d) => d.user),
  });
  const onboarded = profileQ.data
    ? Boolean(profileQ.data.business_name && profileQ.data.phone)
    : user?.onboarded;

  const propertiesQ = useQuery({ queryKey: ['host','properties'], queryFn: () => hostAPI.properties().then((d) => d.properties || []), enabled: !!editingHotelId });
  const hotelForEdit = Array.isArray(propertiesQ.data) ? propertiesQ.data.find((p) => p.id === editingHotelId) : null;

  const [step, setStep] = useState(editingHotelId ? 2 : 0);
  const [createdHotel, setCreatedHotel] = useState(editingHotelId ? { id: editingHotelId, slug: hotelForEdit?.slug } : null);
  const [basics, setBasics] = useState(null);
  const [address, setAddress] = useState(null);
  usePageTitle('Thêm nhà cho thuê');

  const basicsForm = useForm({
    resolver: zodResolver(hotelBasicsSchema),
    defaultValues: { name: '', slug: '', region: '', city: '', description: '', hue: 'sand', property_type: 'Căn hộ 1N' },
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
  const [expandedSection, setExpandedSection] = useState('basic');

  const roomForm = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '', loai_phong_chinh: undefined, loai_can_ho: undefined, type: 'Phòng đơn', view: '', beds: '1 giường đơn', size_sqm: 20, price_per_night: 10000,
      hue: 'sand', special_amenities: '',
      electricity_price: '', water_price: '', management_fee: '', parking_fee: '',
      has_window: false, has_mattress: false,
      toilet_type: '', hour_rule: '', washing_machine: '', has_balcony: false, allow_pets: false, parking_type: '', ev_charger: false,
      structure_desc_title: '', structure_desc_vi_tri: '', structure_desc_tien_ich_xq: '', structure_desc_thuc_te: '',
    },
  });

  const watchedRoom = roomForm.watch();

  const createRoomMut = useMutation({
    mutationFn: (body) => roomsAPI.create(body),
    onSuccess: (d) => {
      setRooms((rs) => [...rs, d.room]);
      setEditingIdx(null);
      roomForm.reset();
      setExpandedSection('basic');
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

  const sections = [
    { id: 'basic',    label: 'Thông tin cơ bản' },
    { id: 'amenities', label: 'Tiện ích phòng' },
    { id: 'costs',    label: 'Chi phí & Điều kiện' },
    { id: 'equipment',label: 'Trang thiết bị' },
    { id: 'desc',     label: 'Mô tả chi tiết' },
  ];

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
    <div className="container" style={{ paddingTop: 36, paddingBottom: 80, maxWidth: 1100 }}>
      <button onClick={() => navigate('/host/dashboard')} className="text-muted mb-4" style={{ fontSize: 13 }}>← Về bảng điều khiển</button>
      <div className="eyebrow mb-3">— {editingHotelId ? `Quản lý · ${hotelForEdit?.name || 'nhà cho thuê'}` : 'Niêm yết nhà cho thuê mới'}</div>
      <h1 className="h-1 mb-6">{editingHotelId ? 'Thêm phòng.' : 'Cùng niêm yết nhà cho thuê của bạn.'}</h1>

      <div className="book-steps">
        {!editingHotelId && ['Thông tin', 'Địa chỉ & tiện nghi', 'Phòng'].map((label, i) => (
          <Fragment key={i}>
            <div className={`book-step ${step === i ? 'is-active' : ''} ${step > i ? 'is-done' : ''}`}>
              <span className="book-step-num">{step > i ? <Icon name="check" size={12} /> : i + 1}</span>
              <span>{label}</span>
            </div>
            {i < 2 && <span className="book-step-line" />}
          </Fragment>
        ))}
      </div>

      <div className="card" style={{ padding: 36 }}>
        {step === 0 && (
          <form className="fade-up" onSubmit={basicsForm.handleSubmit(submitBasics)}>
            <h2 className="h-3 mb-4">Kể về nhà cho thuê của bạn</h2>
            <div className="field mb-3">
              <label className="field-label">Tên nhà cho thuê</label>
              <input className="input" placeholder="Chi Vinh House" {...basicsForm.register('name')} />
              {basicsForm.formState.errors.name && <small style={{ color: 'var(--danger)' }}>{basicsForm.formState.errors.name.message}</small>}
            </div>
            <div className="field mb-3">
              <label className="field-label">Đường dẫn URL</label>
              <input className="input" placeholder="chi-vinh-house" {...basicsForm.register('slug')} />
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
                      type="button" key={h}
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
            <div className="field mb-4">
              <label className="field-label">Loại nhà</label>
              <select className="select" {...basicsForm.register('property_type')}>
                <option>Phòng trọ</option>
                <option>Căn hộ 3N2W</option>
                <option>Căn hộ 2N2W</option>
                <option>Căn hộ 2N1W</option>
                <option>Căn hộ 1N</option>
                <option>Căn hộ studio</option>
                <option>Căn hộ chung cư mini</option>
              </select>
              {basicsForm.formState.errors.property_type && <small style={{ color: 'var(--danger)' }}>{basicsForm.formState.errors.property_type.message}</small>}
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
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingIdx('new'); setExpandedSection('basic'); }}>
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
                        {[r.view, r.beds, r.size_sqm && `${r.size_sqm} m²`].filter(Boolean).join(' · ')}
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
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="row" style={{ flexDirection: 'row-reverse', gap: 0, alignItems: 'stretch' }}>
                    {/* Main form */}
                    <form onSubmit={roomForm.handleSubmit(submitRoom)} style={{ flex: 1, padding: 20 }}>
                      {/* Section tabs */}
                      <div className="row" style={{ gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
                        {sections.map((s) => (
                          <button
                            key={s.id} type="button"
                            className={`chip ${expandedSection === s.id ? 'is-active' : ''}`}
                            onClick={() => setExpandedSection(s.id)}
                            style={{ fontSize: 12 }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>

                      {/* ---- Section: Basic Info ---- */}
                      {expandedSection === 'basic' && (
                        <div className="fade-up">
                          <div className="field mb-4">
                            <label className="field-label">Loại phòng <span style={{ color: 'var(--danger)' }}>*</span></label>
                            <p className="text-muted" style={{ fontSize: 11, marginBottom: 8 }}>Chọn loại phòng để hiển thị đúng trên thẻ phòng và trang chi tiết.</p>
                            <div className="row" style={{ gap: 12 }}>
                              <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer', padding: '10px 16px', borderRadius: 10, border: `1px solid ${roomForm.watch('loai_phong_chinh') === 'CAN_HO' ? 'var(--accent)' : 'var(--line)'}`, background: roomForm.watch('loai_phong_chinh') === 'CAN_HO' ? 'var(--accent-soft)' : 'var(--bg-elev)', flex: 1 }}>
                                <input type="radio" value="CAN_HO" {...roomForm.register('loai_phong_chinh', { required: true })} style={{ accentColor: 'var(--accent)' }} />
                                <span style={{ fontWeight: 500 }}>🟦 Căn hộ</span>
                              </label>
                              <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer', padding: '10px 16px', borderRadius: 10, border: `1px solid ${roomForm.watch('loai_phong_chinh') === 'PHONG_TRO' ? 'var(--accent)' : 'var(--line)'}`, background: roomForm.watch('loai_phong_chinh') === 'PHONG_TRO' ? 'var(--accent-soft)' : 'var(--bg-elev)', flex: 1 }}>
                                <input type="radio" value="PHONG_TRO" {...roomForm.register('loai_phong_chinh', { required: true })} style={{ accentColor: 'var(--accent)' }} />
                                <span style={{ fontWeight: 500 }}>🟩 Phòng trọ</span>
                              </label>
                            </div>
                            {roomForm.formState.errors.loai_phong_chinh && <small style={{ color: 'var(--danger)', display: 'block', marginTop: 4 }}>{roomForm.formState.errors.loai_phong_chinh.message}</small>}

                            {roomForm.watch('loai_phong_chinh') === 'CAN_HO' && (
                              <div className="mt-3 fade-up">
                                <label className="field-label">Loại căn hộ <span style={{ color: 'var(--danger)' }}>*</span></label>
                                <p className="text-muted" style={{ fontSize: 11, marginBottom: 8 }}>Bắt buộc chọn loại căn hộ.</p>
                                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                                  {[
                                    { value: 'CH_3N2W', label: '3N2W (3 phòng ngủ - 2 nhà vệ sinh)' },
                                    { value: 'CH_2N2W', label: '2N2W (2 phòng ngủ - 2 nhà vệ sinh)' },
                                    { value: 'CH_2N1W', label: '2N1W (2 phòng ngủ - 1 nhà vệ sinh)' },
                                    { value: 'STUDIO', label: 'Studio' },
                                  ].map((opt) => (
                                    <label key={opt.value} className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer', padding: '8px 14px', borderRadius: 8, border: `1px solid ${roomForm.watch('loai_can_ho') === opt.value ? 'var(--accent)' : 'var(--line)'}`, background: roomForm.watch('loai_can_ho') === opt.value ? 'var(--accent-soft)' : 'var(--bg-elev)' }}>
                                      <input type="radio" value={opt.value} {...roomForm.register('loai_can_ho')} style={{ accentColor: 'var(--accent)' }} />
                                      <span style={{ fontSize: 13 }}>{opt.label}</span>
                                    </label>
                                  ))}
                                </div>
                                {roomForm.formState.errors.loai_can_ho && <small style={{ color: 'var(--danger)', display: 'block', marginTop: 4 }}>{roomForm.formState.errors.loai_can_ho.message}</small>}
                              </div>
                            )}
                          </div>
                          <div className="form-row-2">
                            <div className="field"><label className="field-label">Tên phòng</label>
                              <input className="input" placeholder="Suite Cổ điển" {...roomForm.register('name')} />
                              {roomForm.formState.errors.name && <small style={{ color: 'var(--danger)' }}>{roomForm.formState.errors.name.message}</small>}
                            </div>
                            <div className="field"><label className="field-label">Loại</label>
                              <input className="input" placeholder="Suite, Cabin, Studio…" {...roomForm.register('type')} />
                              {roomForm.formState.errors.type && <small style={{ color: 'var(--danger)' }}>{roomForm.formState.errors.type.message}</small>}
                            </div>
                            <div className="field">
                              <label className="field-label">Loại nhà</label>
                              {/* bind room-level property_type so it gets submitted with the room create request */}
                              <select className="select" {...roomForm.register('property_type')} defaultValue="Căn hộ 1N">
                                <option>Phòng trọ</option>
                                <option>Căn hộ 3N2W</option>
                                <option>Căn hộ 2N2W</option>
                                <option>Căn hộ 2N1W</option>
                                <option>Căn hộ 1N</option>
                                <option>Căn hộ studio</option>
                                <option>Căn hộ chung cư mini</option>
                              </select>
                            </div>
                          </div>
                          <div className="form-row-3" style={{ marginTop: 12 }}>
                            <div className="field"><label className="field-label">₫ / tháng</label>
                              <input className="input" type="number" {...roomForm.register('price_per_night')} />
                              {roomForm.formState.errors.price_per_night && <small style={{ color: 'var(--danger)' }}>{roomForm.formState.errors.price_per_night.message}</small>}
                            </div>
                            <div className="field"><label className="field-label">Diện tích (m²)</label>
                              <input className="input" type="number" {...roomForm.register('size_sqm')} />
                            </div>
                            <div className="field"><label className="field-label">Tầm nhìn</label>
                              <input className="input" {...roomForm.register('view')} />
                            </div>
                            <div className="field"><label className="field-label">Giường</label>
                              <input className="input" {...roomForm.register('beds')} />
                            </div>
                            <div className="field"><label className="field-label">Tông màu</label>
                              <select className="select" {...roomForm.register('hue')}>
                                {HUES.map((h) => <option key={h} value={h}>{h}</option>)}
                              </select>
                            </div>
                            <div className="field"><label className="field-label">Tình trạng</label>
                              <select className="select" {...roomForm.register('status')}>
                                <option value="available">Còn phòng</option>
                                <option value="unavailable">Đã thuê</option>
                                <option value="maintenance">Bảo trì</option>
                              </select>
                            </div>
                          </div>
                          <div className="field mt-3">
                            <label className="field-label">Tiện nghi đặc biệt</label>
                            <input className="input" placeholder="Ban công riêng, Bồn tắm, Vòi sen ngoài trời" {...roomForm.register('special_amenities')} />
                            <small className="text-muted" style={{ fontSize: 11 }}>Phân cách bằng dấu phẩy — riêng cho phòng này.</small>
                          </div>
                        </div>
                      )}

                      {/* ---- Section: Room Amenities ---- */}
                      {expandedSection === 'amenities' && (
                        <div className="fade-up">
                          <p className="text-muted mb-3" style={{ fontSize: 12 }}>Bật/tắt các tiện ích có trong phòng này.</p>
                          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                            {ROOM_AMENITIES.map((a) => {
                              const fieldName = `amenity_${a.key}`;
                              const on = roomForm.watch(fieldName);
                              return (
                                <button
                                  key={a.key} type="button"
                                  onClick={() => roomForm.setValue(fieldName, !on, { shouldDirty: true })}
                                  className={`vi-amenity-chip ${on ? 'is-on' : 'is-off'}`}
                                  style={{ cursor: 'pointer', border: 'none', fontSize: 13 }}
                                >
                                  <span className="vi-amenity-chip-icon"><Icon name={a.icon} size={15} /></span>
                                  <span className="vi-amenity-chip-label">{a.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* ---- Section: Costs & Conditions ---- */}
                      {expandedSection === 'costs' && (
                        <div className="fade-up">
                          <p className="text-muted mb-3" style={{ fontSize: 12 }}>Nhập số tiền (theo nghìn đồng) cho từng khoản phí.</p>
                          <div className="form-row-2">
                            {COST_FIELDS.map((c) => (
                              <div className="field" key={c.key}>
                                <label className="field-label">{c.label} <small className="text-muted">({c.unit})</small></label>
                                <input className="input" type="number" min="0" placeholder={c.placeholder}
                                       {...roomForm.register(c.key)} />
                              </div>
                            ))}
                          </div>
                          <div className="row" style={{ gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
                            <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
                              <input type="checkbox" {...roomForm.register('has_window')} />
                              Có cửa sổ
                            </label>
                            <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
                              <input type="checkbox" {...roomForm.register('has_mattress')} />
                              Có nệm ngủ sẵn
                            </label>
                          </div>
                        </div>
                      )}

                      {/* ---- Section: Equipment ---- */}
                      {expandedSection === 'equipment' && (
                        <div className="fade-up">
                          <p className="text-muted mb-3" style={{ fontSize: 12 }}>Chọn loại trang thiết bị cho phòng.</p>
                          <div className="form-row-2">
                            {EQUIPMENT_FIELDS.map((e) => (
                              <div className="field" key={e.key}>
                                <label className="field-label">{e.label}</label>
                                <select className="select" {...roomForm.register(e.key)}>
                                  <option value="">Chọn…</option>
                                  {e.options.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                          <div className="row" style={{ gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
                            <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
                              <input type="checkbox" {...roomForm.register('has_balcony')} />
                              Có ban công
                            </label>
                            <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
                              <input type="checkbox" {...roomForm.register('allow_pets')} />
                              Cho phép thú cưng
                            </label>
                            <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13 }}>
                              <input type="checkbox" {...roomForm.register('ev_charger')} />
                              Có sạc xe điện
                            </label>
                          </div>
                        </div>
                      )}

                      {/* ---- Section: Detailed Description ---- */}
                      {expandedSection === 'desc' && (
                        <div className="fade-up">
                          <p className="text-muted mb-3" style={{ fontSize: 12 }}>Mô tả chi tiết phòng trọ để khách hàng có cái nhìn đầy đủ.</p>
                          <div className="field mb-3">
                            <label className="field-label">Tiêu đề mô tả</label>
                            <input className="input" placeholder="Huế – Phòng đơn PHÙ HỢP GIA ĐÌNH" {...roomForm.register('structure_desc_title')} />
                          </div>
                          <div className="field mb-3">
                            <label className="field-label">Vị trí</label>
                            <textarea className="input" rows={2} placeholder="Mô tả vị trí cụ thể của phòng..." {...roomForm.register('structure_desc_vi_tri')} />
                          </div>
                          <div className="field mb-3">
                            <label className="field-label">Tiện ích xung quanh</label>
                            <textarea className="input" rows={2} placeholder="Gần chợ, siêu thị, trường học..." {...roomForm.register('structure_desc_tien_ich_xq')} />
                            <small className="text-muted" style={{ fontSize: 11 }}>Phân cách bằng dấu phẩy.</small>
                          </div>
                          <div className="field mb-3">
                            <label className="field-label">Thực tế</label>
                            <textarea className="input" rows={2} placeholder="Đường xá, khu phố, an ninh..." {...roomForm.register('structure_desc_thuc_te')} />
                          </div>
                        </div>
                      )}

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

                    {/* Preview pane */}
                    <div style={{
                      width: 260, flexShrink: 0, padding: 20,
                      borderLeft: '1px solid var(--line)',
                      background: 'var(--bg)',
                    }}>
                      <div className="eyebrow mb-3" style={{ fontSize: 11 }}>— Xem trước</div>
                      <RoomPreview room={{}} previewRoom={{
                        ...watchedRoom,
                        type: watchedRoom.type || 'Phòng đơn',
                        price_per_night: watchedRoom.price_per_night || 0,
                      }} />
                    </div>
                  </div>
                </div>
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
