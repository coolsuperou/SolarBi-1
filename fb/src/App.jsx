import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import MainLayout from './components/MainLayout';
import PowerMonitorPage from './pages/PowerMonitorPage'; // Import the new page
import UserManagementPage from './pages/UserManagementPage'; // Import the new page

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <MainLayout>
            <PowerMonitorPage />
          </MainLayout>
        }
      />
      <Route
        path="/home"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/power-monitor"
        element={
          <MainLayout>
            <PowerMonitorPage />
          </MainLayout>
        }
      />
      <Route
        path="/user-management"
        element={
          <MainLayout>
            <UserManagementPage />
          </MainLayout>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
