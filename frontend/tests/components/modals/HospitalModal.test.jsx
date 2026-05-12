import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import HospitalModal from '../../../src/components/modals/HospitalModal';

describe('HospitalModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  it('does not render when isOpen is false', () => {
    render(<HospitalModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    const { container } = render(<HospitalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText(/Add New Hospital/i)).toBeInTheDocument();
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
  });

  it('calls onSave with input data when form is submitted', async () => {
    const user = userEvent.setup();
    const { container } = render(<HospitalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const nameInput = container.querySelector('input[name="name"]');
    const addressInput = container.querySelector('input[name="address"]');
    const cityInput = container.querySelector('input[name="city"]');
    const phoneInput = container.querySelector('input[name="phone"]');
    
    await user.type(nameInput, 'City Vet Clinic');
    await user.type(addressInput, '123 Main St');
    await user.type(cityInput, 'Colombo');
    await user.type(phoneInput, '0112233445');

    const saveButton = screen.getByRole('button', { name: /Create Hospital/i });
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'City Vet Clinic',
      address: '123 Main St',
      city: 'Colombo',
      contact: expect.objectContaining({
        phone: '0112233445'
      })
    }), null);
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<HospitalModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});