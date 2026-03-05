import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import Auth from './pages/Auth';
import History from './pages/History';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Combined Login + Signup Page */}
        <Route path="/auth" element={<Auth />} />

        {/* User Settings */}
        <Route path="/history" element={<History />} />

        {/* Fallback 404 */}
        <Route path="*" element={<NoPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
