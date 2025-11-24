import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { User, ExternalLink, Github } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <Container maxWidth="2xl" className="py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full opacity-0 group-hover:opacity-50 blur transition duration-500" />
              <img src={logo} alt="BuilderGraph Logo" className="relative w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-lg text-text-primary tracking-tight">BuilderGraph</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/projects"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all"
            >
              Projects
            </Link>
            <Link
              to="/dashboard/endorsements"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all"
            >
              Endorsements
            </Link>
            <Link
              to="/recruiter"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all"
            >
              Recruiters
            </Link>
            <Link
              to="https://dkg.origintrail.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all flex items-center gap-2"
            >
              DKG Explorer <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/alex_dev"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all group"
            >
              <User className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
              <span className="text-sm font-medium text-text-primary">My Profile</span>
            </Link>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                Sign In
              </Button>
              <Button size="sm" className="bg-white text-black hover:bg-white/90">
                <Github className="w-4 h-4 mr-2" />
                Connect
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
};

export { Navbar };
