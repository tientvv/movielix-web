export function useAdminAuth() {
  const adminToken = useCookie<string | null>('admin_token', { maxAge: 86400, path: '/' });

  const isAdminLoggedIn = computed(() => !!adminToken.value);

  function getToken(): string {
    return adminToken.value || '';
  }

  function authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${getToken()}` };
  }

  function requireAuth(): boolean {
    if (!adminToken.value) {
      navigateTo('/admin/login');
      return false;
    }
    return true;
  }

  function login(token: string) {
    adminToken.value = token;
  }

  function logout() {
    adminToken.value = null;
    navigateTo('/admin/login');
  }

  return { getToken, authHeaders, requireAuth, isAdminLoggedIn, login, logout };
}
