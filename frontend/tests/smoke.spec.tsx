import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import App from '../src/App.tsx';
import { ThemeProvider } from '../src/components/ThemeProvider.tsx';

const renderApp = (path = '/jobs') => {
  const queryClient = new QueryClient();
  return renderToString(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe('App smoke test', () => {
  it('renders initial app loading shell for jobs route', () => {
    const html = renderApp('/jobs');
    expect(html).toContain('Checking session');
  });

  it('renders initial app loading shell for workers route', () => {
    const html = renderApp('/workers');
    expect(html).toContain('Checking session');
  });
});
