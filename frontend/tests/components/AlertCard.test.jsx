import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AlertCard from '../../src/components/AlertCard';

// Mock the global fetch API to prevent real network calls for reverse geocoding
global.fetch = vi.fn();

describe('AlertCard Component', () => {
  const mockAlert = {
    _id: '1',
    type: 'Lost Pet',
    message: 'Golden Retriever lost near Central Park.',
    createdAt: new Date('2026-05-10T10:00:00Z').toISOString(),
    location: {
      coordinates: [80.7718, 7.8731] // [lng, lat]
    }
  };

  beforeEach(() => {
    fetch.mockReset();
  });

  it('renders alert message and type correctly', () => {
    render(<AlertCard alert={mockAlert} />);
    
    expect(screen.getByText('Lost Pet')).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever lost near Central Park.')).toBeInTheDocument();
  });

  it('attempts to fetch reverse geocoding data and updates location name', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'OK',
        results: [
          {
            address_components: [
              { long_name: 'Central Park', types: ['neighborhood', 'political'] }
            ]
          }
        ]
      })
    });

    render(<AlertCard alert={mockAlert} />);

    // Wait for the async useEffect to update the location tag
    await waitFor(() => {
      expect(screen.getByText('Central Park')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('maps.googleapis.com/maps/api/geocode'));
  });

  it('applies the correct styling theme based on alert type', () => {
    const outbreakAlert = { ...mockAlert, type: 'Disease Outbreak' };
    const { container } = render(<AlertCard alert={outbreakAlert} />);
    
    // Check if the red theme classes are applied for Disease Outbreak
    const cardWrapper = container.firstChild;
    expect(cardWrapper).toHaveClass('bg-red-50');
    expect(cardWrapper).toHaveClass('border-red-100');
  });
});