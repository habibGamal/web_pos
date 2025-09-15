/**
 * Sample test file to verify Jest and RTL setup
 */

import { render, screen } from '@testing-library/react';

// Simple component for testing
function TestComponent() {
  return <div>Hello, Testing World!</div>;
}

describe('Test Setup', () => {
  it('should render a test component', () => {
    render(<TestComponent />);
    
    expect(screen.getByText('Hello, Testing World!')).toBeInTheDocument();
  });

  it('should have proper Jest matchers', () => {
    expect(true).toBe(true);
    expect('test').toContain('est');
    expect([1, 2, 3]).toHaveLength(3);
  });
});