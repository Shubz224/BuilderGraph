import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { api } from '../../services/api';

interface GitHubLoginButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GitHubLoginButton: React.FC<GitHubLoginButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const handleLogin = () => {
    api.loginWithGitHub();
  };

  const variantStyles = {
    primary: 'bg-gray-900 hover:bg-gray-800 text-white border-gray-700',
    secondary: 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500',
    outline: 'bg-transparent hover:bg-white/10 text-white border-white/30',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={handleLogin}
      className={`
        inline-flex items-center justify-center gap-2 
        border-2 rounded-lg 
        font-semibold
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      <FaGithub className="text-xl" />
      <span>Continue with GitHub</span>
    </button>
  );
};

export default GitHubLoginButton;
