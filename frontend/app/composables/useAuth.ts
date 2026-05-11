export function useAuth() {
  const token = useCookie<string | null>('auth_token', { maxAge: 86400 * 30, path: '/' });
  const user = useCookie<{ username: string; role: string } | null>('auth_user', { maxAge: 86400 * 30, path: '/' });

  const isLoggedIn = computed(() => !!token.value);

  function login(newToken: string, userData: { username: string; role: string }) {
    token.value = newToken;
    user.value = userData;
  }

  function logout() {
    token.value = null;
    user.value = null;
    navigateTo('/login');
  }

  function requireAuth(redirectPath?: string): boolean {
    if (!token.value) {
      if (redirectPath) {
        navigateTo(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      } else {
        navigateTo('/login');
      }
      return false;
    }
    return true;
  }

  return { token, user, isLoggedIn, login, logout, requireAuth };
}
