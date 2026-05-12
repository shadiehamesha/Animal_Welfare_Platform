import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EventAttendeesModal from '../../../src/components/modals/EventAttendeesModal';

describe('EventAttendeesModal Component', () => {
  const mockEvent = {
    title: 'Weekend Adoption Drive',
    capacity: 50,
    registeredAttendees: [
      { _id: 'u1', name: 'John Doe', email: 'john@example.com' },
      { _id: 'u2', name: 'Jane Smith', email: 'jane@example.com' }
    ]
  };

  it('renders event details and attendee count', () => {
    render(<EventAttendeesModal isOpen={true} onClose={vi.fn()} event={mockEvent} />);
    
    expect(screen.getByText('Weekend Adoption Drive')).toBeInTheDocument();
    expect(screen.getByText('2 / 50')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('shows red warning styling when capacity is full', () => {
    const fullEvent = {
      ...mockEvent,
      capacity: 2,
    };

    const { container } = render(<EventAttendeesModal isOpen={true} onClose={vi.fn()} event={fullEvent} />);
    
    const countElement = screen.getByText('2 / 2');
    expect(countElement).toHaveClass('text-red-500');
    
    // Check if the progress bar turns red
    const progressBar = container.querySelector('.bg-red-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders empty state if no attendees are registered', () => {
    const emptyEvent = { ...mockEvent, registeredAttendees: [] };
    render(<EventAttendeesModal isOpen={true} onClose={vi.fn()} event={emptyEvent} />);

    expect(screen.getByText('No Attendees Yet')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});