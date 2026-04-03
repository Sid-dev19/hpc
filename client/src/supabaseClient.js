// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export const auth = {
  // Sign up with email and password
  signUp: async (email, password, options = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: options.role || 'student', // Default role
          name: options.name,
          school_id: options.schoolId,
          grade: options.grade,
          section: options.section,
          roll_no: options.rollNo,
          is_active: true
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions
export const db = {
  // Generic query function
  query: async (table, options = {}) => {
    let query = supabase.from(table);
    
    if (options.select) query = query.select(options.select);
    if (options.where) query = query.eq(options.where.column, options.where.value);
    if (options.order) query = query.order(options.order.column, options.order.ascending);
    if (options.limit) query = query.limit(options.limit);
    if (options.single) query = query.single();
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Insert function
  insert: async (table, data) => {
    const { data, error } = await supabase.from(table).insert(data);
    if (error) throw error;
    return data;
  },

  // Update function
  update: async (table, updates, where) => {
    const { data, error } = await supabase.from(table).update(updates).eq(where.column, where.value);
    if (error) throw error;
    return data;
  },

  // Delete function
  delete: async (table, where) => {
    const { error } = await supabase.from(table).delete().eq(where.column, where.value);
    if (error) throw error;
    return true;
  }
};

export default supabase;
