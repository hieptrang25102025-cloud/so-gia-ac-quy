import { getSupabase } from './supabaseClient';
import { UserRole } from '../types';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
}

export const authService = {
  // Get currently logged-in user profile with role
  async getCurrentProfile(): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;

      // Query role from public.user_profiles
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Fallback to metadata if trigger hasn't fired yet
        const metaRole = (user.user_metadata?.role as UserRole) || 'viewer';
        return {
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Người dùng',
          role: metaRole,
        };
      }

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name || profile.email?.split('@')[0] || 'Người dùng',
        role: (profile.role as UserRole) || 'viewer',
        createdAt: profile.created_at,
      };
    } catch (err) {
      console.warn('Error fetching current profile:', err);
      return null;
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Chưa cấu hình kết nối Supabase.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await this.getCurrentProfile();
        return { success: true, profile: profile || undefined };
      }

      return { success: false, error: 'Đăng nhập không thành công.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi kết nối xác thực' };
    }
  },

  // Register or create a new account (Admin only can specify role)
  async signUp(
    email: string, 
    password: string, 
    role: UserRole = 'viewer', 
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Chưa cấu hình Supabase.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role,
            full_name: fullName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi tạo tài khoản' };
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  // Listen to Auth State Changes
  onAuthStateChange(callback: (profile: UserProfile | null) => void): { unsubscribe: () => void } {
    const supabase = getSupabase();
    if (!supabase) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await authService.getCurrentProfile();
        callback(profile);
      } else {
        callback(null);
      }
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
