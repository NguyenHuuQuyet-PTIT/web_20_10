(function () {
  'use strict';

  const content = document.getElementById('appContent');
  const partials = [
    'partials/site-shell.html',
    'partials/scene-1.html',
    'partials/scene-2.html',
    'partials/scene-3.html',
    'partials/toast.html'
  ];
  const scripts = [
    'js/data.js',
    'js/audio-engine.js',
    'js/mascot-3d.js',
    'js/app.js'
  ];

  async function loadPartial(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
    return response.text();
  }

  function loadScript(path) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = path;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${path}`));
      document.body.appendChild(script);
    });
  }

  async function start() {
    try {
      const markup = await Promise.all(partials.map(loadPartial));
      content.innerHTML = markup.join('\n');

      for (const script of scripts) await loadScript(script);
      window.startEcardApp();
    } catch (error) {
      console.error('Failed to load the page:', error);
      content.innerHTML = '<p role="alert" style="margin:2rem auto;max-width:40rem;padding:1rem;color:#7f1d1d;background:#fff1f2;border-radius:1rem">Không tải được giao diện. Hãy tải lại trang và kiểm tra các file đã được deploy đầy đủ.</p>';
    }
  }

  start();
})();
