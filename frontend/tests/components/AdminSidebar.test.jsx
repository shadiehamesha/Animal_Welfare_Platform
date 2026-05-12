import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminSidebar from '../../src/components/AdminSidebar';

describe('AdminSidebar Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'fake-jwt');
    localStorage.setItem('role', 'system admin');
  });

  it('renders all admin navigation links', () => {
    render(
      <MemoryRouter>
        <AdminSidebar isMobileOpen={false} setIsMobileOpen={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('AdminPanel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Hospitals/i })).toBeInTheDocument();
  });

  it('clears localStorage and navigates to login when Log Out is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/dashboard/admin']}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminSidebar isMobileOpen={false} />} />
          <Route path="/login" element={<div>Mock Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Initial check
    expect(localStorage.getItem('token')).toBe('fake-jwt');

    const logoutBtn = screen.getByRole('button', { name: /Log Out/i });
    await user.click(logoutBtn);

    // Storage should be cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();

    // Verify Router redirection happened
    expect(screen.getByText('Mock Login Page')).toBeInTheDocument();
  });

  it('highlights the active link correctly', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/admin/users']}>
        <AdminSidebar isMobileOpen={false} />
      </MemoryRouter>
    );

    const usersLink = screen.getByRole('link', { name: /Users/i });
    
    // Check if React Router active classes applied our custom Tailwind styling
    expect(usersLink).toHaveClass('bg-teal-50');
    expect(usersLink).toHaveClass('text-teal-700');
  });
});