import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage.jsx';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
  );
}

export default App;