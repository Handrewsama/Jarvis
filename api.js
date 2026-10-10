
(() => {
  'use strict';

  const TOKEN_KEY = 'jarvis.api.token';

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  async function request(path, options = {}) {
    const token = getToken();

    if (!token) {
      throw new Error('Cal configurar el token de JARVIS.');
    }

    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
        throw new Error('Token incorrecte o sessió caducada.');
      }

      throw new Error(data.error || 'Error en la connexió amb JARVIS.');
    }

    return data;
  }

  window.JarvisAPI = {
    setToken(token) {
      if (typeof token !== 'string' || token.trim().length < 32) {
        throw new Error('El token no és vàlid.');
      }

      sessionStorage.setItem(TOKEN_KEY, token.trim());
    },

    clearToken() {
      sessionStorage.removeItem(TOKEN_KEY);
    },

    getTasks() {
      return request('/api/tasks');
    },

    createTask(task) {
      return request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: task.title,
          description: task.description || '',
          due_at: task.due || null
        })
      });
    }
  };
})();
