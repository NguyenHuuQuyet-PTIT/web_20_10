(function () {
  'use strict';

  const original = {
    assets: window.ASSETS_20_10,
    profiles: window.CLASSMATES_PROFILES,
    data: window.DEFAULT_DATA_20_10
  };
  const initialAssets = clone(original.assets);
  const editor = document.getElementById('content');
  const quickEditor = document.getElementById('quickEditor');
  const status = document.getElementById('status');
  const frame = document.getElementById('preview');
  let previewReady = false;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function initialDocument() {
    return { profiles: clone(original.profiles), data: clone(original.data) };
  }

  function readDocument() {
    const value = JSON.parse(editor.value);
    if (!value || !Array.isArray(value.profiles) || !value.data || typeof value.data !== 'object') {
      throw new Error('JSON cần có profiles (dạng danh sách) và data (dạng đối tượng).');
    }
    return value;
  }

  function say(message, isError) {
    status.textContent = message;
    status.style.color = isError ? '#b91c1c' : '#9f1239';
  }

  function sendPreview() {
    const doc = readDocument();
    if (!previewReady || !frame.contentWindow || !frame.contentWindow.setEcardPreviewData) {
      say('Bản xem trước đang tải. Bấm cập nhật xem trước sau vài giây nhé.', true);
      return;
    }
    frame.contentWindow.setEcardPreviewData({ assets: clone(original.assets), profiles: doc.profiles, data: doc.data });
    renderQuickEditor(doc);
    say('Đã cập nhật bản xem trước.');
  }

  function setPath(target, path, value) {
    const keys = path.split('.').filter(Boolean);
    if (!keys.length) throw new Error('Vị trí nội dung đang trống.');
    let cursor = target;
    for (const key of keys.slice(0, -1)) {
      if (cursor[key] === undefined || cursor[key] === null) throw new Error(`Không tìm thấy đoạn “${key}” trong vị trí đã nhập.`);
      cursor = cursor[key];
    }
    const finalKey = keys[keys.length - 1];
    if (!(finalKey in cursor)) throw new Error(`Không tìm thấy trường “${finalKey}”.`);
    cursor[finalKey] = value;
  }

  function getPath(target, path) {
    return path.split('.').filter(Boolean).reduce((value, key) => value == null ? undefined : value[key], target);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderQuickEditor(doc) {
    const fields = [];
    const add = (group, label, path) => fields.push({ group, label, path, value: getPath(doc, path) });
    add('Thiệp', 'Tiêu đề trang', 'data.brandTitle');
    add('Thiệp', 'Dòng người nhận', 'data.recipientSub');
    add('Nhạc', 'Tên giai điệu', 'data.customAudioName');
    (doc.profiles || []).forEach((profile, index) => {
      const group = `Lời chúc đầu trang • ${profile.name || profile.key}`;
      add(group, 'Tiêu đề', `profiles.${index}.heroTitle`);
      add(group, 'Lời chúc', `profiles.${index}.heroWish`);
      add(group, 'Lời chào của linh vật', `profiles.${index}.mascotGreeting`);
    });
    (doc.data.stories || []).forEach((story, index) => {
      const group = `Trạm ${index + 1} • ${story.station || ''}`;
      add(group, 'Tên trạm', `data.stories.${index}.station`);
      add(group, 'Tiêu đề thư', `data.stories.${index}.title`);
      add(group, 'Câu trích dẫn', `data.stories.${index}.quote`);
      add(group, 'Nội dung thư', `data.stories.${index}.letter`);
      add(group, 'Chữ ký', `data.stories.${index}.signature`);
    });
    (doc.data.gallery || []).forEach((item, index) => {
      const group = `Ảnh ${index + 1} • ${item.title || ''}`;
      add(group, 'Tiêu đề ảnh', `data.gallery.${index}.title`);
      add(group, 'Nhãn ảnh', `data.gallery.${index}.tag`);
      add(group, 'Mô tả ảnh', `data.gallery.${index}.desc`);
    });
    (doc.data.wishesWall || []).forEach((item, index) => {
      const group = `Lời nhắn ${index + 1}`;
      add(group, 'Người gửi', `data.wishesWall.${index}.sender`);
      add(group, 'Người nhận', `data.wishesWall.${index}.recipient`);
      add(group, 'Nội dung', `data.wishesWall.${index}.content`);
    });
    let activeGroup = '';
    quickEditor.innerHTML = fields.map((field) => {
      const heading = field.group !== activeGroup ? `<h3>${escapeHtml(field.group)}</h3>` : '';
      activeGroup = field.group;
      return `${heading}<label class="quick-field"><span>${escapeHtml(field.label)}</span><textarea data-path="${escapeHtml(field.path)}">${escapeHtml(field.value)}</textarea></label>`;
    }).join('');
  }

  function jsString(value) {
    return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
  }

  editor.value = JSON.stringify(initialDocument(), null, 2);
  renderQuickEditor(initialDocument());
  quickEditor.addEventListener('input', (event) => {
    const field = event.target.closest('[data-path]');
    if (!field) return;
    try {
      const doc = readDocument();
      setPath(doc, field.dataset.path, field.value);
      editor.value = JSON.stringify(doc, null, 2);
    } catch (error) { say(error.message, true); }
  });
  function onPreviewReady() {
    previewReady = true;
    try { sendPreview(); } catch (error) { say(error.message, true); }
  }
  frame.addEventListener('load', () => {
    frame.contentWindow.addEventListener('ecard:ready', onPreviewReady);
    if (frame.contentWindow._ecardReady) onPreviewReady();
  });
  frame.src = 'index.html?preview=1';

  document.getElementById('previewButton').addEventListener('click', () => {
    try { sendPreview(); } catch (error) { say(`JSON chưa hợp lệ: ${error.message}`, true); }
  });

  document.getElementById('resetButton').addEventListener('click', () => {
    editor.value = JSON.stringify(initialDocument(), null, 2);
    original.assets = clone(initialAssets);
    renderQuickEditor(initialDocument());
    say('Đã khôi phục dữ liệu ban đầu trong trang chỉnh sửa.');
  });

  document.getElementById('importButton').addEventListener('click', () => {
    const file = document.getElementById('assetFile').files[0];
    if (!file) return say('Chọn ảnh hoặc nhạc từ máy trước nhé.', true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const doc = readDocument();
        const assets = clone(original.assets);
        const path = document.getElementById('assetPath').value.trim();
        if (path.startsWith('assets.')) setPath(assets, path.slice('assets.'.length), reader.result);
        else setPath(doc, path, reader.result);
        editor.value = JSON.stringify(doc, null, 2);
        if (path.startsWith('assets.')) original.assets = assets;
        renderQuickEditor(doc);
        say(`Đã đưa “${file.name}” vào ${path}. Nhấn xem trước để kiểm tra.`);
      } catch (error) { say(error.message, true); }
    };
    reader.onerror = () => say('Không đọc được file đã chọn.', true);
    reader.readAsDataURL(file);
  });

  document.getElementById('exportButton').addEventListener('click', () => {
    try {
      const doc = readDocument();
      const output = `/* Nội dung thiệp đã chốt. File này được xuất từ editor.html. */\nwindow.ASSETS_20_10 = ${jsString(original.assets)};\nwindow.CLASSMATES_PROFILES = ${jsString(doc.profiles)};\nwindow.DEFAULT_DATA_20_10 = ${jsString(doc.data)};\n`;
      const url = URL.createObjectURL(new Blob([output], { type: 'text/javascript;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.js';
      link.click();
      URL.revokeObjectURL(url);
      say('Đã tải data.js. Hãy chép đè vào thư mục js/ rồi kiểm tra trang chính trước khi deploy.');
    } catch (error) { say(`Chưa xuất được: ${error.message}`, true); }
  });
})();
