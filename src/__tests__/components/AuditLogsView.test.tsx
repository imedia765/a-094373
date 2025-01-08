import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuditLogsView from '@/components/AuditLogsView';
import { mockAuditLogs } from '../mocks/supabaseMock';

describe('AuditLogsView', () => {
  beforeEach(() => {
    render(<AuditLogsView />);
  });

  it('renders the header with correct title', () => {
    expect(screen.getByText('System Logs')).toBeInTheDocument();
    expect(screen.getByText('View and manage system audit and monitoring logs')).toBeInTheDocument();
  });

  it('shows the correct tabs', () => {
    expect(screen.getByRole('tab', { name: /audit logs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /monitoring logs/i })).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    const monitoringTab = screen.getByRole('tab', { name: /monitoring logs/i });
    fireEvent.click(monitoringTab);
    expect(monitoringTab).toHaveAttribute('aria-selected', 'true');
  });
});