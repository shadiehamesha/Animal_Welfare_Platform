import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MedicineModal from '../../../src/components/modals/MedicineModal';

describe('MedicineModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  it('does not render when isOpen is false', () => {
    render(<MedicineModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.queryByText(/Add New Medicine/i)).not.toBeInTheDocument();
  });

  it('renders empty form when adding new medicine', () => {
    render(<MedicineModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} medicine={null} />);
    
    expect(screen.getByText('Add New Medicine')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add to Inventory/i })).toBeInTheDocument();
  });

  it('renders prepopulated form when editing existing medicine', () => {
    const existingMedicine = {
      _id: 'med123',
      name: 'Amoxicillin',
      category: 'Antibiotics',
      price: 1500,
      description: 'Used for bacterial infections',
      inStock: false
    };

    const { container } = render(
      <MedicineModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} medicine={existingMedicine} />
    );
    
    expect(screen.getByText('Edit Medicine')).toBeInTheDocument();
    expect(container.querySelector('input[name="name"]')).toHaveValue('Amoxicillin');
    expect(container.querySelector('input[name="price"]')).toHaveValue(1500);
    expect(container.querySelector('textarea[name="description"]')).toHaveValue('Used for bacterial infections');
    expect(container.querySelector('input[name="inStock"]')).not.toBeChecked();
  });

  it('calls onSave with input data when form is submitted', async () => {
    const user = userEvent.setup();
    const { container } = render(<MedicineModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

    const nameInput = container.querySelector('input[name="name"]');
    const priceInput = container.querySelector('input[name="price"]');
    const descInput = container.querySelector('textarea[name="description"]');
    
    await user.type(nameInput, 'Paracetamol');
    await user.type(priceInput, '450');
    await user.type(descInput, 'Pain relief');

    const saveButton = screen.getByRole('button', { name: /Add to Inventory/i });
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Paracetamol',
      price: '450',
      description: 'Pain relief',
      inStock: true
    }), null);
  });
});