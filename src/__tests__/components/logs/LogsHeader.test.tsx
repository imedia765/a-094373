import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LogsHeader from '@/components/logs/LogsHeader';

describe('LogsHeader', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle'
  };

  it('renders with provided title and subtitle', () => {
    render(<LogsHeader {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.subtitle)).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<LogsHeader {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toHaveClass('text-2xl', 'font-bold');
    expect(screen.getByText(defaultProps.subtitle)).toHaveClass('text-muted-foreground');
  });
});