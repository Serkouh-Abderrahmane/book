import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RoomCard from '../components/RoomCard';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

const baseHotel = {
  id: 1,
  slug: 'test-hotel',
  name: 'Test Hotel',
  city: 'Hue',
  region: 'Thua Thien Hue',
  hue: 'sand',
  hero_image_url: null,
  amenities: [],
};

describe('RoomCard property_type display', () => {
  test('shows badge for room with property_type', () => {
    const room = {
      id: 1,
      property_type: 'Căn hộ 2N1W',
      type: 'Standard',
      price_per_night: 5000,
      name: 'Room 1',
      status: 'available',
    };

    render(
      <MemoryRouter>
        <RoomCard hotel={baseHotel} room={room} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Căn hộ 2N1W/)).toBeDefined();
  });

  test('shows badge for hotel with property_type', () => {
    const hotel = { ...baseHotel, property_type: 'Phòng trọ' };

    render(
      <MemoryRouter>
        <RoomCard hotel={hotel} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Phòng trọ/)).toBeDefined();
  });

  test('does not show badge when property_type is missing', () => {
    const room = {
      id: 3,
      type: 'Standard',
      price_per_night: 5000,
      name: 'Room 3',
      status: 'available',
    };

    render(
      <MemoryRouter>
        <RoomCard hotel={baseHotel} room={room} />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Căn hộ/)).toBeNull();
    expect(screen.queryByText(/Phòng trọ/)).toBeNull();
  });

  test('shows badge with normalized property_type', () => {
    const room = {
      id: 1,
      property_type: 'Studio',
      type: 'Standard',
      price_per_night: 5000,
      name: 'Room 1',
      status: 'available',
    };

    render(
      <MemoryRouter>
        <RoomCard hotel={baseHotel} room={room} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Căn hộ studio/)).toBeDefined();
  });
});
