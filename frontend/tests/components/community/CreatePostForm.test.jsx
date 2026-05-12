import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CreatePostForm from '../../../src/components/community/CreatePostForm';

describe('CreatePostForm Component', () => {
  const mockOnSubmit = vi.fn();

  it('renders the form fields correctly', () => {
    render(<CreatePostForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    expect(screen.getByLabelText(/Topic Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Details/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post to Community/i })).toBeInTheDocument();
  });

  it('calls onSubmit with title and content when form is submitted', async () => {
    const user = userEvent.setup();
    render(<CreatePostForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    const titleInput = screen.getByLabelText(/Topic Title/i);
    const contentInput = screen.getByLabelText(/Details/i);
    const submitBtn = screen.getByRole('button', { name: /Post to Community/i });

    await user.type(titleInput, 'Best diet for older cats?');
    await user.type(contentInput, 'Looking for recommendations for my 12-year-old tabby.');
    await user.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Best diet for older cats?',
      content: 'Looking for recommendations for my 12-year-old tabby.'
    });
  });

  it('displays "Posting..." and disables the button when isSubmitting is true', () => {
    render(<CreatePostForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    
    const submitBtn = screen.getByRole('button', { name: /Posting.../i });
    expect(submitBtn).toBeDisabled();
  });
});