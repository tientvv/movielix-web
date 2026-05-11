export function useAdminAuth() {
  const auth = useAuth();

  const isAdmin = computed(() => auth.isLoggedIn.value && auth.user.value?.role === 'ADMIN');

  function authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${auth.token.value}` };
  }

  function requireAuth(): boolean {
    if (!auth.isLoggedIn.value) {
      navigateTo('/login?redirect=/admin');
      return false;
    }
    if (auth.user.value?.role !== 'ADMIN') {
      navigateTo('/');
      return false;
    }
    return true;
  }

  function logout() {
    auth.logout();
  }

  return { isAdmin, authHeaders, requireAuth, logout, token: auth.token, user: auth.user };
}
