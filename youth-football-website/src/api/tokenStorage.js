const ACCESS_KEY = 'ba_access_token';
const REFRESH_KEY = 'ba_refresh_token';

export function storeTokens({ accessToken, refreshToken }) {
  if (accessToken) sessionStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
