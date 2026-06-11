import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar.jsx';

function renderNav() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AdminNavbar isOpen={true} onToggle={() => {}} />
    </MemoryRouter>
  );
}

describe('AdminNavbar', () => {
  test('renders all nav items', () => {
    renderNav();
    expect(screen.getByText('Tổng quan')).toBeDefined();
    expect(screen.getByText('Nhà cho thuê')).toBeDefined();
    expect(screen.getByText('Phòng')).toBeDefined();
    expect(screen.getByText('Đặt phòng')).toBeDefined();
    expect(screen.getByText('Xem phòng')).toBeDefined();
    expect(screen.getByText('Đánh giá')).toBeDefined();
    expect(screen.getByText('Khách hàng')).toBeDefined();
    expect(screen.getByText('Cài đặt')).toBeDefined();
  });

  test('renders all nav links with correct paths', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    const paths = links.map((l) => l.getAttribute('href'));
    expect(paths).toContain('/admin');
    expect(paths).toContain('/admin/hotels');
    expect(paths).toContain('/admin/rooms');
    expect(paths).toContain('/admin/bookings');
    expect(paths).toContain('/admin/viewings');
    expect(paths).toContain('/admin/reviews');
    expect(paths).toContain('/admin/customers');
    expect(paths).toContain('/admin/settings');
  });

  test('highlights active dashboard link on /admin', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminNavbar isOpen={true} onToggle={() => {}} />
      </MemoryRouter>
    );
    const activeLinks = document.querySelectorAll('.admin-nav-item.is-active');
    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0].textContent).toContain('Tổng quan');
  });

  test('highlights active rooms link on /admin/rooms', () => {
    render(
      <MemoryRouter initialEntries={['/admin/rooms']}>
        <AdminNavbar isOpen={true} onToggle={() => {}} />
      </MemoryRouter>
    );
    const activeLinks = document.querySelectorAll('.admin-nav-item.is-active');
    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0].textContent).toContain('Phòng');
  });

  test('renders the admin logo and title', () => {
    renderNav();
    expect(screen.getByText('CVL')).toBeDefined();
    expect(screen.getByText('Admin')).toBeDefined();
  });
});
