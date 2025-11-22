import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './pages/HomePage';
import { CreateHikePage } from './pages/CreateHikePage';
import { HikeDetailPage } from './pages/HikeDetailPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateHikePage />} />
            <Route path="/hikes/:id" element={<HikeDetailPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
