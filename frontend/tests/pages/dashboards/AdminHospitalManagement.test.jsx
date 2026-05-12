import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminHospitalManagement from '../../../src/pages/dashboards/AdminHospitalManagement';

// Mock the global fetch API
global.fetch = vi.fn();

const mockHospitals = [
  { _id: '1', name: 'Happy Paws Vet', location: { lat: 0, lng: 0 }, address: '123 Lane', city: 'Galle', contact: { phone: '0112233445' }, hours: { is24_7: true }, reviews: [] },
  { _id: '2', name: 'Care Animal Hospital', location: { lat: 0, lng: 0 }, address: '456 Road', city: 'Colombo', contact: { phone: '0119988776' }, hours: { is24_7: false, open: '09:00', close: '17:00' }, reviews: [] }
];

describe('AdminHospitalManagement Dashboard', () => {
  beforeEach(() => {
    fetch.mockReset();
    localStorage.clear();
    const validJwtMock = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsIm5hbWUiOiJBZG1pbiJ9.signature';
    localStorage.setItem('token', validJwtMock); 
  });

  it('fetches and displays a list of hospitals successfully', async () => {
    // Handle both fetches (user data AND hospitals list)
    fetch.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ ok: true, json: async () => ({ name: 'Admin User' }) });
      }
      if (url.includes('/api/hospitals')) {
        return Promise.resolve({ ok: true, json: async () => mockHospitals });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <AdminHospitalManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Happy Paws Vet')).toBeInTheDocument();
      expect(screen.getByText('Care Animal Hospital')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ ok: true, json: async () => ({ name: 'Admin User' }) });
      }
      if (url.includes('/api/hospitals')) {
        return Promise.reject(new Error('Failed to fetch'));
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <MemoryRouter>
        <AdminHospitalManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No hospitals found/i)).toBeInTheDocument();
    });
  });

  it('calls delete API when delete button is clicked', async () => {
    const user = userEvent.setup();
    
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    fetch.mockImplementation((url, options) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ ok: true, json: async () => ({ name: 'Admin User' }) });
      }
      if (url.includes('/api/hospitals') && (!options || options.method === 'GET')) {
        return Promise.resolve({ ok: true, json: async () => mockHospitals });
      }
      if (url.includes('/api/hospitals/1') && options && options.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(
      <MemoryRouter>
        <AdminHospitalManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Happy Paws Vet')).toBeInTheDocument();
    });

    const hospitalNameElement = screen.getByText('Happy Paws Vet');
    const hospitalCard = hospitalNameElement.closest('.bg-white');
    const deleteButton = hospitalCard.querySelector('button.text-red-600');
    
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton);
    expect(confirmSpy).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/hospitals/1'), expect.objectContaining({
        method: 'DELETE'
      }));
    });

    confirmSpy.mockRestore();
  });
});