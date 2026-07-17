import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { JobCard } from '@/features/jobs/components/JobCard';
import { JobApplication } from '@/features/jobs/api/jobsApi';

// Mock the API hooks
vi.mock('@/features/jobs/api/jobsApi', () => ({
  useDeleteJob: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

const mockJob: JobApplication = {
  _id: '123',
  companyName: 'OpenAI',
  jobTitle: 'Frontend Engineer',
  status: 'Interview',
  location: 'San Francisco',
  salary: '$150k - $200k',
  url: 'https://openai.com/jobs',
  notes: 'Test notes',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

describe('JobCard', () => {
  it('renders job details correctly', () => {
    render(<JobCard job={mockJob} onEdit={vi.fn()} onSetReminder={vi.fn()} />);

    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('$150k - $200k')).toBeInTheDocument();
    expect(screen.getByText(/Updated/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit menu item is clicked', async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();
    render(<JobCard job={mockJob} onEdit={handleEdit} onSetReminder={vi.fn()} />);

    // Open dropdown menu
    await user.click(screen.getByRole('button'));

    // Click edit
    const editItem = await screen.findByText('Edit');
    await user.click(editItem);
    
    expect(handleEdit).toHaveBeenCalledWith(mockJob);
  });

  it('calls onSetReminder when reminder menu item is clicked', async () => {
    const user = userEvent.setup();
    const handleSetReminder = vi.fn();
    render(<JobCard job={mockJob} onEdit={vi.fn()} onSetReminder={handleSetReminder} />);

    await user.click(screen.getByRole('button'));
    
    const reminderItem = await screen.findByText('Set Reminder');
    await user.click(reminderItem);
    
    expect(handleSetReminder).toHaveBeenCalledWith(mockJob);
  });
});
