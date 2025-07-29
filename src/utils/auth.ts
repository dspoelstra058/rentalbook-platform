import { User } from '../types';

class AuthService {
  private currentUser: User | null = null;

  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@platform.com' && password === 'admin123') {
          this.currentUser = {
            id: 'admin-1',
            email: 'admin@platform.com',
            name: 'Platform Admin',
            role: 'admin',
            createdAt: new Date()
          };
          resolve(this.currentUser);
        } else if (email.includes('@') && password.length >= 6) {
          this.currentUser = {
            id: 'user-' + Date.now(),
            email,
            name: email.split('@')[0],
            role: 'owner',
            createdAt: new Date()
          };
          resolve(this.currentUser);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  register(email: string, password: string, name: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = {
          id: 'user-' + Date.now(),
          email,
          name,
          role: 'owner',
          createdAt: new Date()
        };
        resolve(this.currentUser);
      }, 1000);
    });
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();