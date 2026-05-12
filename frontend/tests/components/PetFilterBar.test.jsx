import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PetFilterBar from '../../src/components/PetFilterBar';

describe('PetFilterBar Component', () => {
  const mockSetFilters = vi.fn();
  const initialFilters = { search: '', species: '', size: '', age: '', sort: 'newest' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with placeholder labels', () => {
    render(<PetFilterBar filters={initialFilters} setFilters={mockSetFilters} />);
    
    expect(screen.getByPlaceholderText(/Search by name or breed/i)).toBeInTheDocument();
    
    expect(screen.getAllByText('All Species')[0]).toBeInTheDocument();
    expect(screen.getAllByText('All Sizes')[0]).toBeInTheDocument();
  });

  it('calls setFilters when search input changes', async () => {
    const user = userEvent.setup();
    render(<PetFilterBar filters={initialFilters} setFilters={mockSetFilters} />);

    const searchInput = screen.getByPlaceholderText(/Search by name or breed/i);
    await user.type(searchInput, 'Golden');

    expect(mockSetFilters).toHaveBeenCalled();
  });

  it('selects an option from the custom dropdown', async () => {
    const user = userEvent.setup();
    render(<PetFilterBar filters={initialFilters} setFilters={mockSetFilters} />);

    const speciesDropdown = screen.getByRole('button', { name: /All Species/i });
    await user.click(speciesDropdown);

    const dogOption = screen.getByText('Dogs');
    await user.click(dogOption);

    expect(mockSetFilters).toHaveBeenCalled();
  });

  it('clears all filters when "Clear Filters" is clicked', async () => {
    const user = userEvent.setup();
    const modifiedFilters = { search: 'Max', species: 'Dog', size: 'Large', age: '', sort: 'newest' };
    
    render(<PetFilterBar filters={modifiedFilters} setFilters={mockSetFilters} />);

    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    await user.click(clearButton);

    expect(mockSetFilters).toHaveBeenCalledWith({
      search: '',
      species: '',
      size: '',
      age: '',
      sort: 'newest'
    });
  });
});