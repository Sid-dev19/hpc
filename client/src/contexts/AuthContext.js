// Authentication Context for React
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase, auth, db } from '../supabaseClient';

// Initial state
const initialState = {
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  role: null,
  schoolId: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_SESSION: 'SET_SESSION',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        loading: false,
        isAuthenticated: !!action.payload,
        role: action.payload?.user_metadata?.role || action.payload?.role,
        schoolId: action.payload?.user_metadata?.school_id || action.payload?.school_id
      };
    
    case AUTH_ACTIONS.SET_SESSION:
      return {
        ...state,
        session: action.payload,
        loading: false,
        isAuthenticated: !!action.payload
      };
    
    case AUTH_ACTIONS.SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: action.payload,
        loading: false
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        loading: false
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await auth.getCurrentSession();
        if (session) {
          const user = await auth.getCurrentUser();
          dispatch({ type: AUTH_ACTIONS.SET_SESSION, payload: session });
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
          dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: true });
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: false });
        }
      } catch (error) {
        console.error('Session check error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    checkSession();

    // Listen to auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' && session) {
        dispatch({ type: AUTH_ACTIONS.SET_SESSION, payload: session });
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: session.user });
        dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: true });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Authentication functions
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      const user = await auth.signIn(email, password);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: true });
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: error.message };
    }
  };

  const signUp = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      const user = await auth.signUp(userData.email, userData.password, userData);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      dispatch({ type: AUTH_ACTIONS.SET_AUTHENTICATED, payload: true });
      return { success: true, user };
    } catch (error) {
      console.error('Signup error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      await auth.signOut();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const value = {
    ...state,
    login,
    signUp,
    logout,
    // Direct access to auth functions
    signIn: auth.signIn,
    signOut: auth.signOut,
    getCurrentUser: auth.getCurrentUser,
    getCurrentSession: auth.getCurrentSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider };
