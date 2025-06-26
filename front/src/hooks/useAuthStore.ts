import { create } from 'zustand';
import { AuthStatus } from '../types/auth';

interface AuthStore extends AuthStatus {
  login: () => void;
  logout: () => void;
  setAuthStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  is_authenticated: false,
  username: undefined,
  scopes: undefined,
  
  login: () => {
    // TODO: Implement actual GitHub OAuth login
    set({ 
      is_authenticated: true, 
      username: 'demo-user',
      scopes: ['public_repo'] 
    });
  },
  
  logout: () => {
    set({ 
      is_authenticated: false, 
      username: undefined,
      scopes: undefined 
    });
  },
  
  setAuthStatus: (status: AuthStatus) => {
    set(status);
  }
}));