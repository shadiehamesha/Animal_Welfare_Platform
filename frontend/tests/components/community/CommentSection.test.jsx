import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CommentSection from '../../../src/components/community/CommentSection';

describe('CommentSection Component', () => {
  const mockComments = [
    { _id: 'c1', content: 'You should take it to a vet.', author: { name: 'Dr. Smith' }, createdAt: new Date().toISOString() },
    { _id: 'c2', content: 'I can help foster it!', author: { name: 'Alice' }, createdAt: new Date().toISOString() }
  ];
  
  const mockOnAddComment = vi.fn().mockResolvedValue();

  it('renders login prompt when user is not logged in', () => {
    render(
      <MemoryRouter>
        <CommentSection comments={mockComments} onAddComment={mockOnAddComment} isLoggedIn={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Please log in to join the discussion.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log In to Reply/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Add to the discussion/i)).not.toBeInTheDocument();
  });

  it('renders comment form when user is logged in', () => {
    render(
      <MemoryRouter>
        <CommentSection comments={mockComments} onAddComment={mockOnAddComment} isLoggedIn={true} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Add to the discussion/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reply/i })).toBeInTheDocument();
  });

  it('submits a new comment successfully', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CommentSection comments={[]} onAddComment={mockOnAddComment} isLoggedIn={true} />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Add to the discussion/i);
    const submitBtn = screen.getByRole('button', { name: /Reply/i });

    // Button should be disabled initially when input is empty
    expect(submitBtn).toBeDisabled();

    await user.type(input, 'This is a test comment');
    expect(submitBtn).not.toBeDisabled();

    await user.click(submitBtn);

    expect(mockOnAddComment).toHaveBeenCalledTimes(1);
    expect(mockOnAddComment).toHaveBeenCalledWith('This is a test comment');
  });

  it('renders the list of existing comments', () => {
    render(
      <MemoryRouter>
        <CommentSection comments={mockComments} onAddComment={mockOnAddComment} isLoggedIn={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Comments (2)')).toBeInTheDocument();
    expect(screen.getByText('You should take it to a vet.')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});