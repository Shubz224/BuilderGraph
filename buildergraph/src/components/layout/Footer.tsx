import React from 'react';
import { Container } from '../ui/Container';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-background-card/50">
      <Container maxWidth="2xl" className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-text-primary mb-4">BuilderGraph</h3>
            <p className="text-text-secondary text-sm">
              Verifiable developer reputation on the Decentralized Knowledge Graph
            </p>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-text-primary transition">Features</a></li>
              <li><a href="#" className="hover:text-text-primary transition">Pricing</a></li>
              <li><a href="#" className="hover:text-text-primary transition">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-text-primary transition">About</a></li>
              <li><a href="#" className="hover:text-text-primary transition">Blog</a></li>
              <li><a href="#" className="hover:text-text-primary transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-text-primary transition">Privacy</a></li>
              <li><a href="#" className="hover:text-text-primary transition">Terms</a></li>
              <li><a href="#" className="hover:text-text-primary transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center text-text-secondary text-sm">
          <p>&copy; 2025 BuilderGraph. Powered by OriginTrail DKG</p>
        </div>
      </Container>
    </footer>
  );
};

export { Footer };
