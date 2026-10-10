(() => {
  'use strict';
  const KEY = 'jarvis.tasks.v1';
  let suppress = false, timer = null, busy = false, queued = false;
  const $ = s => document.querySelector(s);
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const status = (message, good = false) => {
    const el = $('#jarvisSyncStatus');
    if (el) { el.textContent = message; el.style.color = good ? '#159c77' : ''; }
  };
  function localTasks() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function setLocalTasks(tasks) {
    suppress = true;
    originalSetItem(KEY, JSON.stringify(tasks));
    suppress = false;
    window.dispatchEvent(new CustomEvent('jarvis:tasks-reloaded'));
  }
  async function syncNow() {
    if (!window.JarvisAPI?.hasToken()) return;
    if (busy) { queued = true; return; }
    busy = true;
    try {
      await window.JarvisAPI.syncTasks(localTasks());
      status('Sincronitzat correctament amb Cloudflare.', true);
    } catch (e) {
      status('Error de sincronització: ' + e.message);
    } finally {
      busy = false;
      if (queued) { queued = false; syncNow(); }
    }
  }
  localStorage.setItem = function(key, value) {
    originalSetItem(key, value);
    if (key === KEY && !suppress && window.JarvisAPI?.hasToken()) {
      clearTimeout(timer);
      timer = setTimeout(syncNow, 500);
    }
  };
  async function connect() {
    const input = $('#jarvisApiToken');
    try {
      if (input.value.trim()) window.JarvisAPI.setToken(input.value.trim());
      if (!window.JarvisAPI.hasToken()) throw new Error('Introdueix el token privat creat a Cloudflare.');
      status('Connectant…');
      const remote = await window.JarvisAPI.getTasks();
      const remoteTasks = (remote.tasks || []).map(t => ({
        id: String(t.id), title: t.title, description: t.description || '',
        due: t.due_at || '', priority: t.priority || 'medium',
        done: t.status === 'completed', createdAt: t.created_at || new Date().toISOString()
      }));
      const local = localTasks();
      if (remoteTasks.length && local.length) {
        const useRemote = confirm('La base de dades ja conté tasques. D’acord = carregar les tasques del núvol i substituir les locals. Cancel·lar = mantenir les locals i pujar-les al núvol.');
        if (useRemote) setLocalTasks(remoteTasks);
        else await window.JarvisAPI.syncTasks(local);
      } else if (remoteTasks.length) {
        setLocalTasks(remoteTasks);
      } else {
        await window.JarvisAPI.syncTasks(local);
      }
      status('Connectat i sincronitzat.', true);
      input.value = '';
      if (typeof window.jarvisRender === 'function') window.jarvisRender();
      else location.reload();
    } catch (e) { status('No s’ha pogut connectar: ' + e.message); }
  }
  document.addEventListener('DOMContentLoaded', () => {
    $('#jarvisConnectBtn')?.addEventListener('click', connect);
    $('#jarvisDisconnectBtn')?.addEventListener('click', () => {
      window.JarvisAPI.clearToken();
      status('Desconnectat. Les dades locals es mantenen.');
      if ($('#jarvisApiToken')) $('#jarvisApiToken').value = '';
    });
    if (window.JarvisAPI?.hasToken()) status('Token disponible en aquesta sessió. Prem connectar per sincronitzar.');
  });
})();
