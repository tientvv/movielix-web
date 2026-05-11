export default defineNuxtRouteMiddleware((to) => {
  // Redirect logged-in users away from login page
  if (to.path === '/login') {
    const authToken = useCookie<string | null>('auth_token');
    if (authToken.value) {
      const redirect = to.query.redirect as string;
      return navigateTo(redirect || '/');
    }
  }
});
