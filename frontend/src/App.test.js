import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders loading state initially', () => {
  render(<App />);
  const loadingElement = screen.getByText(/Chargement/i);
  expect(loadingElement).toBeInTheDocument();
});

test('renders RPG game title after loading', async () => {
  render(<App />);
  await waitFor(() => {
    const titleElement = screen.getByText(/Game RPG/i);
    expect(titleElement).toBeInTheDocument();
  });
}); 