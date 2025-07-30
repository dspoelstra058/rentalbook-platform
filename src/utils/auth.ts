import { User } from '../types';
import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

class AuthService {
  private currentUser: User | null = null;
  private initialized = false;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await this.loadUserProfile(session.user);
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      }
    });

    this.initialized = true;
  }

  private async loadUserProfile(supabaseUser: SupabaseUser): Promise<void> {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          await this.createUserProfile(supabaseUser);
          return;
        }
        throw error;
      }

      this.currentUser = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name || supabaseUser.email?.split('@')[0] || 'User',
        role: userProfile.role as 'owner' | 'admin',
        createdAt: new Date(userProfile.created_at)
      };
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.currentUser = null;
    }
  }

  private async createUserProfile(supabaseUser: SupabaseUser): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
          role: 'owner'
        })
        .select()
        .single();

      if (error) throw error;

      this.currentUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as 'owner' | 'admin',
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned');
      }

      // Wait for the auth state change to load the profile
      await this.waitForUserLoad();

      if (!this.currentUser) {
        throw new Error('Failed to load user profile');
      }

      return this.currentUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  async register(email: string, password: string, name: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed - no user returned');
      }

      // If email confirmation is disabled, the user will be automatically signed in
      if (data.session) {
        await this.waitForUserLoad();
        if (!this.currentUser) {
          throw new Error('Failed to load user profile after registration');
        }
        return this.currentUser;
      }

      // If email confirmation is enabled, create a temporary user object
      return {
        id: data.user.id,
        email: email,
        name: name,
        role: 'owner',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error instanceof Error ? error : new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw new Error(error.message);
      }
      this.currentUser = null;
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear the local user
      this.currentUser = null;
      throw error instanceof Error ? error : new Error('Logout failed');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async waitForInitialization(): Promise<void> {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async waitForUserLoad(): Promise<void> {
    // Wait up to 5 seconds for user profile to load
    const maxWait = 5000;
    const startTime = Date.now();
    
    while (!this.currentUser && (Date.now() - startTime) < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Admin helper method to update user roles
  async updateUserRole(userId: string, role: 'owner' | 'admin'): Promise<void> {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      throw new Error('Only admins can update user roles');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw error instanceof Error ? error : new Error('Failed to update user role');
    }
  }

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  // Check if user has admin role
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}

export const authService = new AuthService();