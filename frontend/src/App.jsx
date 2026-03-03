import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage.jsx';
import About from './pages/about.jsx';
import ContactUs from './pages/contactus.jsx';
import PrivacyPolicy from './pages/privacypolicy.jsx'
import Login from './pages/login.jsx';
import SignUp from './pages/signup.jsx';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
  );
}

export default App;