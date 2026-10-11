(() => {
  'use strict';
  const TOKEN_KEY = 'jarvis.api.token';
  function getToken() { return sessionStorage.getItem(TOKEN_KEY) || ''; }
  async function request(path, options = {}) {
    const token = getToken();
    if (!token) throw new Error('Cal configurar el token de JARVIS.');
    const response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers, 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Keep the token for diagnosis; the user can explicitly disconnect or replace it.
      throw new Error(data.error || (response.status === 401 ? 'Token incorrecte o sessió caducada.' : 'Error en la connexió amb JARVIS.'));
    }
    return data;
  }
  window.JarvisAPI = {
    setToken(token) {
      if (typeof token !== 'string' || token.trim().length < 32) throw new Error('El token no és vàlid.');
      sessionStorage.setItem(TOKEN_KEY, token.trim());
    },
    clearToken() { sessionStorage.removeItem(TOKEN_KEY); },
    hasToken() { return !!getToken(); },
    getTasks() { return request('/api/tasks'); },
    syncTasks(tasks) { return request('/api/tasks', { method: 'POST', body: JSON.stringify({ action: 'sync', tasks }) }); }
  };
})();
