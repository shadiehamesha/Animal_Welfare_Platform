import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModerationReviewModal from '../../src/components/ModerationReviewModal';

describe('ModerationReviewModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnAction = vi.fn();

  const mockPost = {
    _id: 'post123',
    title: 'Question about Vet',
    content: 'Is this specific medication safe for dogs?',
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render if isOpen is false', () => {
    render(<ModerationReviewModal isOpen={false} onClose={mockOnClose} item={mockPost} type="post" onAction={mockOnAction} />);
    expect(screen.queryByText(/Review Pending/i)).not.toBeInTheDocument();
  });

  it('renders Post title and content correctly', () => {
    render(<ModerationReviewModal isOpen={true} onClose={mockOnClose} item={mockPost} type="post" onAction={mockOnAction} />);
    
    expect(screen.getByText('Review Pending Post')).toBeInTheDocument();
    expect(screen.getByText('Question about Vet')).toBeInTheDocument();
    expect(screen.getByText('Is this specific medication safe for dogs?')).toBeInTheDocument();
  });

  it('triggers onAction with "rejected" when Reject is clicked', async () => {
    const user = userEvent.setup();
    render(<ModerationReviewModal isOpen={true} onClose={mockOnClose} item={mockPost} type="post" onAction={mockOnAction} />);

    await user.click(screen.getByRole('button', { name: /Reject & Delete/i }));
    
    expect(mockOnAction).toHaveBeenCalledTimes(1);
    expect(mockOnAction).toHaveBeenCalledWith('post123', 'post', 'rejected');
  });

  it('triggers onAction with "approved" when Approve is clicked', async () => {
    const user = userEvent.setup();
    render(<ModerationReviewModal isOpen={true} onClose={mockOnClose} item={mockPost} type="post" onAction={mockOnAction} />);

    await user.click(screen.getByRole('button', { name: /Approve Content/i }));
    
    expect(mockOnAction).toHaveBeenCalledTimes(1);
    expect(mockOnAction).toHaveBeenCalledWith('post123', 'post', 'approved');
  });
});