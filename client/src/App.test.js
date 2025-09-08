import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header title', () => {
  render(<App />);
  expect(screen.getByText(/Produktivitäts-Assistent/i)).toBeInTheDocument();
});
