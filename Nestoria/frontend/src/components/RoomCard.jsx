import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import Photo from './Photo.jsx';

function formatPrice(vnd) {
  return Number(vnd || 0).toLocaleString('vi-VN');
}

function statusLabel(status) {
  switch (status) {
    case 'available':   return { text: 'Còn trống', clr: 'var(--success)' };
    case 'unavailable': return { text: 'Đã thuê',   clr: 'var(--danger)' };
    case 'maintenance': return { text: 'Bảo trì',   clr: 'var(--warn)' };
    default:            return { text: 'Còn trống', clr: 'var(--success)' };
  }
}

function RoomBadge({ verified }) {
  if (!verified) return null;
  return (
    <span className="room-badge-verified">
      <Icon name="shield" size={12} /> Đã xác thực
    </span>
  );
}

function AmenityIcons({ amenities, specialAmenities, size = 14 }) {
  if (!amenities && !specialAmenities) return null;
  if (specialAmenities && typeof specialAmenities === 'string') {
    const tags = specialAmenities.split(',').map((s) => s.trim()).filter(Boolean);
    return (
      <div className="room-amenity-tags">
        {tags.map((t) => (
          <span key={t} className="room-amenity-tag">{t}</span>
        ))}
      </div>
    );
  }
  if (Array.isArray(amenities) && amenities.length > 0) {
    return (
      <div className="room-amenity-icons">
        {amenities.slice(0, 6).map((a) => (
          <span key={a.key} className="room-amenity-icon" title={a.label}>
            <Icon name={a.icon} size={size} />
          </span>
        ))}
      </div>
    );
  }
  return null;
}

export default function RoomCard({
  hotel,
  room,
  saved,
  onSave,
  onBook,
  onChat,
  onCall,
}) {
  const navigate = useNavigate();

  const hasRoom = Boolean(room);
  const isVerified = hasRoom
    ? room.status === 'available'
    : Boolean(hotel.badge);

  const roomCode = hasRoom
    ? (room.name || room.type || `P.${room.id}`)
    : hotel.name;

  const imageUrl = hasRoom
    ? (room.image_url || hotel.hero_image_url)
    : hotel.hero_image_url;

  const price = hasRoom ? room.price_per_night : (hotel.price_from || 0);
  const priceUnit = 'tháng';

  const addressParts = [];
  if (hotel.address) addressParts.push(hotel.address);
  if (hotel.ward)    addressParts.push(hotel.ward);
  if (hotel.region)  addressParts.push(hotel.region);
  if (hotel.city)    addressParts.push(hotel.city);
  const address = addressParts.length > 0 ? addressParts.join(', ') : null;

  const detailPath = hasRoom
    ? `/hotel/${hotel.hotel_slug || hotel.slug}?room=${room.id}`
    : `/hotel/${hotel.slug}`;

  const st = hasRoom ? statusLabel(room.status) : null;

  const handleBook = (e) => {
    e.stopPropagation();
    if (onBook) onBook(hotel, room);
  };
  const handleChat = (e) => {
    e.stopPropagation();
    if (onChat) onChat(hotel, room);
  };
  const handleCall = (e) => {
    e.stopPropagation();
    if (onCall) onCall(hotel, room);
  };

  return (
    <article
      className={`room-card ${hasRoom ? 'room-card--room' : 'room-card--hotel'}`}
      onClick={() => navigate(detailPath)}
    >
      <div className="room-card-img">
        <Photo hue={hotel.hue} src={imageUrl} alt={roomCode} />
        {onSave && (
          <button
            className={`room-card-save ${saved ? 'is-saved' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSave(hotel.id); }}
            aria-label="Lưu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
      </div>

      <div className="room-card-body">
        <div className="room-card-head">
          <div className="room-card-title-row">
            <h3 className="room-card-title">{roomCode}</h3>
            <RoomBadge verified={isVerified} />
          </div>
          {hasRoom && room.type && room.type !== roomCode && (
            <span className="room-card-type">{room.type}</span>
          )}
        </div>

        <div className="room-card-price">
          <span className="room-card-price-amount">{formatPrice(price)}₫</span>
          <span className="room-card-price-unit">/{priceUnit}</span>
        </div>

        {address && (
          <p className="room-card-address">{address}</p>
        )}

        <div className="room-card-facts">
          {hasRoom && room.beds && (
            <span className="room-card-fact">
              <Icon name="moon" size={12} /> {room.beds}
            </span>
          )}
          {room && room.size_sqm && (
            <span className="room-card-fact">
              <Icon name="compass" size={12} /> {room.size_sqm}m²
            </span>
          )}
          {st && (
            <span className="room-card-fact" style={{ color: st.clr }}>
              <span className="room-card-dot" style={{ background: st.clr }} />
              {st.text}
            </span>
          )}
        </div>

        <AmenityIcons
          amenities={room ? room.amenities : hotel.amenities}
          specialAmenities={room ? room.special_amenities : null}
          size={14}
        />

        <div className="room-card-actions">
          {onBook && (
            <button className="btn btn-primary btn-sm" onClick={handleBook}>
              <Icon name="calendar" size={13} /> Đặt lịch xem
            </button>
          )}
          {onChat && (
            <button className="room-card-action-icon" onClick={handleChat} aria-label="Chat ngay">
              <Icon name="mail" size={16} />
            </button>
          )}
          {onCall && (
            <button className="room-card-action-icon" onClick={handleCall} aria-label="Gọi hỗ trợ">
              <Icon name="phone" size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
