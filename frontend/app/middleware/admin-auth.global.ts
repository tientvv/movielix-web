export default defineNuxtRouteMiddleware((to) => {
  // Only apply to admin pages (excluding admin login which we'll redirect)
  if (!to.path.startsWith('/admin')) return;

  // Redirect /admin/login to regular /login
  if (to.path === '/admin/login') {
    return navigateTo('/login?redirect=/admin');
  }

  const authToken = useCookie<string | null>('auth_token');
  const authUser = useCookie<{ username: string; role: string } | null>('auth_user');

  // Not logged in at all → go to login
  if (!authToken.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // Logged in but not admin → go to home
  if (authUser.value?.role !== 'ADMIN') {
    return navigateTo('/');
  }
});
