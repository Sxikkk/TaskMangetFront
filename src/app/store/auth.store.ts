import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import { User } from '@/entities/user';
import { getUserById } from '@/entities/user/api/user.api.ts'; // Import getUserById
import { loginUser, logoutUser } from '@/features/auth/api/auth.api.ts';
import { LoginRequestDto } from '@/features/auth/model/types';
import { decode } from 'punycode';

// Interface for decoded token payload (adjust based on backend claims)
interface DecodedToken {
  userId: string;
  email: string;
  // Add other claims like exp, iat if needed
  exp: number;
}

// Auth State Interface
interface AuthState {
  user: User | null;
  token: string | null; // Access Token
  refreshToken: string | null; // Added for potential refresh logic
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Internal Actions Interface
type AuthActions = {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Updated to handle both tokens and fetch/set user
  setSession: (accessToken: string | null, refreshToken: string | null) => Promise<void>; 
  clearSession: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  token: localStorage.getItem('authToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  error: null,
  isLoading: true, // Start loading true until checkAuth completes
  isAuthenticated: false, // Assume not authenticated until checkAuth confirms

  // Internal Actions Implementation
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Clears tokens, user, error and updates localStorage
  clearSession: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, error: null });
  },

  // Sets tokens, decodes access token, fetches user, updates state
  setSession: async (accessToken, refreshTokenValue) => {

    if (!accessToken) {
        get().clearSession();
        return;
    }

    try {
        const decoded = jwtDecode<DecodedToken>(accessToken);
        console.log(decoded);
        // Optional: Check token expiry client-side (backend validation is still primary)
        if (decoded.exp * 1000 < Date.now()) {
            console.warn('Token expired on setSession');
            get().clearSession();
            throw new Error('Session expired');
        }
        localStorage.setItem('authToken', accessToken);
        // Fetch full user details using userId from token
        const userDetails = await getUserById(decoded.userId); 
        if (refreshTokenValue) {
            localStorage.setItem('refreshToken', refreshTokenValue);
        }
        set({ 
            user: userDetails, 
            token: accessToken, 
            refreshToken: refreshTokenValue,
            isAuthenticated: true, 
            error: null 
        });

    } catch (error: any) {
        console.error('Error setting session (decode/fetch user):', error);
        get().clearSession(); // Clear session if token is invalid or user fetch fails
        // Optionally set an error message
        set({ error: 'Failed to initialize session. Please login again.' });
    }
  },

  // Core Authentication Logic
  login: async (credentials) => {
    get().setLoading(true);
    get().setError(null);
    try {
      // Login returns { accessToken, refreshToken }
      const { accessToken, refreshToken } = await loginUser(credentials);
      // setSession handles decoding token, fetching user, and setting state
      await get().setSession(accessToken, refreshToken);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      get().setError(message);
      get().clearSession(); // Ensure session is cleared on login failure
      console.error('Login error:', message);
      throw new Error(message); // Re-throw for component handling
    } finally {
      get().setLoading(false);
    }
  },

  logout: async () => {
    get().setLoading(true);
    try {
       await logoutUser(); // Optional backend call
    } catch (err: any) {
      console.error('Logout error (server call failed):', err.message);
    } finally {
        // Always clear client-side session regardless of backend call success
       get().clearSession(); 
       set({ isLoading: false }); // Set loading false after clearing session
    }
  },

  checkAuth: async () => {
    get().setError(null); // Clear any previous errors
    const currentToken = get().token;
    const currentRefreshToken = get().refreshToken; // Keep track for potential refresh

    if (!currentToken) {
        set({ isLoading: false, isAuthenticated: false }); // Not loading, not authenticated
        return;
    }

    get().setLoading(true);
    try {
        // Attempt to set session using the existing token
        // This will decode, check expiry (basic), fetch user, and update state
        await get().setSession(currentToken, currentRefreshToken); 
        // If setSession succeeds, state (user, isAuthenticated) is updated internally
    } catch (error) {
        // setSession handles clearing the session on error internally
        console.error('checkAuth failed:', error);
        // TODO: Implement token refresh logic here if currentToken is expired but refreshToken is valid
        // For now, if setSession fails, we remain logged out.
    } finally {
        set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Call checkAuth when the app loads (e.g., in index.tsx or App.tsx)
// useAuthStore.getState().checkAuth(); 