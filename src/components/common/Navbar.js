import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0a0a2a] p-4 shadow-lg relative">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-cyan-400 neon-text">TYPOGRAM</h1>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-cyan-300">
          <li><Link to="/" className="hover:text-white">Home</Link></li>
          <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
          <li><Link to="/practice" className="hover:text-white">Practice</Link></li>
          <li><Link to="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
          <li><Link to="/community" className="hover:text-white">Community</Link></li>
          <li><Link to="/live" className="hover:text-white">Live Sessions</Link></li>
          <li><Link to="/refer" className="hover:text-white">Refer & Earn</Link></li>
          <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
          <li><Link to="/logout" className="hover:text-white">Logout</Link></li>
        </ul>
        
        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-cyan-300 text-2xl">
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="absolute top-16 left-0 w-full bg-[#0a0a2a] p-4 space-y-4 text-cyan-300 md:hidden">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/courses">Courses</Link></li>
          <li><Link to="/practice">Practice</Link></li>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
          <li><Link to="/community">Community</Link></li>
          <li><Link to="/live">Live Sessions</Link></li>
          <li><Link to="/refer">Refer & Earn</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      )}

      {/* CSS for Neon Effect */}
      <style>{`
        .neon-text {
          text-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
        }
      `}</style>
    </nav>
  );
}