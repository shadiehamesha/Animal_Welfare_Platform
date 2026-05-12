import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProtectedRoute from '../../src/utils/ProtectedRoute';

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  const TestApp = ({ allowedRoles }) => (
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  it('redirects to /login if there is no token', () => {
    render(<TestApp />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders protected content if token exists and no specific roles are required', () => {
    localStorage.setItem('token', 'fake-jwt-token');
    
    render(<TestApp />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to / if user role is not in allowedRoles', () => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('role', 'user');
    
    render(<TestApp allowedRoles={['system admin', 'organization']} />);
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders protected content if user role matches allowedRoles', () => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('role', 'organization'); 
    
    render(<TestApp allowedRoles={['system admin', 'organization']} />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});