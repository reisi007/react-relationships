/**
 * Service for handling client-side Google OAuth 2.0 Implicit Flow.
 * Stores access tokens securely in localStorage with expiration handling.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_PLACEHOLDER';
const REDIRECT_URI = window.location.origin;
const SCOPES = [
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/tasks'
];

const STORAGE_KEY_TOKEN = 'nw_auth_token';
const STORAGE_KEY_EXPIRES = 'nw_auth_expires';

export const googleAuth = {
  login(): void {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', SCOPES.join(' '));
    authUrl.searchParams.append('prompt', 'select_account');

    window.location.href = authUrl.toString();
  },

  handleCallback(): boolean {
    const hash = window.location.hash;
    if (!hash) return false;

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (accessToken && expiresIn) {
      const expirationTime = Date.now() + parseInt(expiresIn, 10) * 1000;
      localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEY_EXPIRES, expirationTime.toString());
      
      window.location.hash = '';
      return true;
    }

    return false;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EXPIRES);
    window.location.reload();
  },

  getToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expires = localStorage.getItem(STORAGE_KEY_EXPIRES);

    if (!token || !expires) return null;

    if (Date.now() > parseInt(expires, 10)) {
      this.logout();
      return null;
    }

    return token;
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
};