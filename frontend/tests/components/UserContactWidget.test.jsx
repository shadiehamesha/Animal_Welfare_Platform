import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserContactWidget from '../../src/components/UserContactWidget';

global.fetch = vi.fn();

describe('UserContactWidget Component', () => {
  const mockMessages = [
    { _id: '1', subject: 'Account Issue', message: 'Help me', status: 'pending', createdAt: new Date().toISOString() },
    { _id: '2', subject: 'Feedback', message: 'Great app', status: 'resolved', createdAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    fetch.mockReset();
    localStorage.setItem('token', 'fake-token');
  });

  it('fetches and displays recent messages', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessages
    });

    render(<UserContactWidget />);

    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('resolved')).toBeInTheDocument();
    });
  });

  it('displays empty state if no messages exist', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<UserContactWidget />);

    await waitFor(() => {
      expect(screen.getByText(/You haven't sent any messages/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Contact Us/i })).toBeInTheDocument();
    });
  });

  it('opens modal and filters messages when "View All" is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMessages
    });

    const user = userEvent.setup();
    render(<UserContactWidget />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View All/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /View All/i }));
    
    // Check if modal title and full messages are rendered
    expect(screen.getByText('Message History')).toBeInTheDocument();
    expect(screen.getByText('Account Issue')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: '✕' });
    await user.click(closeBtn);
    expect(screen.queryByText('Message History')).not.toBeInTheDocument();
  });
});