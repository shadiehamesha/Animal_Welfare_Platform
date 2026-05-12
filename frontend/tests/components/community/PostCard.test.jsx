import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import PostCard from '../../../src/components/community/PostCard';

describe('PostCard Component', () => {
  const mockPost = {
    _id: 'post123',
    title: 'Found a stray kitten',
    content: 'Found a small kitten near the library. Need advice on what to feed it.',
    createdAt: new Date('2026-05-11T12:00:00Z').toISOString(),
    author: { name: 'Jane Doe' }
  };

  it('renders post content and author correctly', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} isDetail={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('Found a stray kitten')).toBeInTheDocument();
    expect(screen.getByText(/Found a small kitten near the library/i)).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // Author Initial Avatar
  });

  it('renders the "Read full post" link when isDetail is false', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} isDetail={false} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /Read full post/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/community/post/post123');
  });

  it('does not render the "Read full post" link when isDetail is true', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} isDetail={true} />
      </MemoryRouter>
    );

    expect(screen.queryByRole('link', { name: /Read full post/i })).not.toBeInTheDocument();
  });
});