/*
  POST-EDITOR.JS
  ----------------------------------------
  Toda la lógica del formulario para escribir un post: subir archivos
  (con detección automática de imagen/audio/texto/otro y opción NSFW),
  insertar enlaces de YouTube/Twitter/Discord, y la barra de texto
  enriquecido (negrita, subrayado, color). La usan new-post.html y
  edit-post.html — ambas comparten los mismos IDs de formulario.

  Requiere que la página ya haya cargado github-auth.js (usa getAuth,
  authHeaders, githubErrorMessage, uploadAssetToGithub) y que exista
  un textarea #f-content.
*/

let coverSrc = '';
let coverNsfw = false;
let insertSrc = '';
let insertCategory = 'other';
let uploadsInProgress = 0;

function fileToDataUrl(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function detectFileCategory(file){
  const type = file.type || '';
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if(type.startsWith('image/')) return 'image';
  if(type.startsWith('audio/') || AUDIO_EXT.includes(ext)) return 'audio';
  if(type.startsWith('text/') || TEXT_EXT.includes(ext)) return 'text';
  return 'other';
}

function trackUpload(promise){
  uploadsInProgress++;
  const genBtn = document.getElementById('genBtn');
  if(genBtn) genBtn.disabled = true;
  promise.finally(()=>{
    uploadsInProgress--;
    if(genBtn) genBtn.disabled = uploadsInProgress > 0;
  });
  return promise;
}

function setUploadStatus(elId, text, type){
  const el = document.getElementById(elId);
  if(!el) return;
  el.textContent = text;
  el.className = 'upload-status ' + type;
}

/* ---------- pestañas URL / archivo ---------- */
function wireImgTabs(pickerName){
  const tabs = document.querySelectorAll(`.img-tab[data-picker="${pickerName}"]`);
  const panes = document.querySelectorAll(`.img-pane[data-picker="${pickerName}"]`);
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      panes.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.img-pane[data-picker="${pickerName}"][data-mode="${tab.dataset.mode}"]`).classList.add('active');
    });
  });
}

/* ---------- portada ---------- */
function initCoverPicker(){
  wireImgTabs('cover');

  document.getElementById('cover-url').addEventListener('input', (e)=>{
    coverSrc = e.target.value.trim();
    showCoverPreview(coverSrc);
  });

  document.getElementById('cover-nsfw').addEventListener('change', (e)=>{
    coverNsfw = e.target.checked;
  });

  document.getElementById('cover-file').addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const auth = getAuth();
    if(!auth){ alert('Inicia sesión primero.'); return; }

    const localPreview = await fileToDataUrl(file);
    showCoverPreview(localPreview);
    setUploadStatus('cover-upload-status', 'Subiendo imagen a images/ en GitHub...', 'info');
    coverSrc = '';

    trackUpload((async ()=>{
      try{
        const path = await uploadAssetToGithub(file, auth);
        coverSrc = path;
        setUploadStatus('cover-upload-status', `✔ imagen subida: ${path}`, 'success');
      }catch(err){
        setUploadStatus('cover-upload-status', err.message || 'No se pudo subir la imagen.', 'error');
      }
    })());
  });
}

function showCoverPreview(src){
  const wrap = document.getElementById('cover-preview');
  if(!src){ wrap.classList.remove('show'); wrap.innerHTML = ''; return; }
  wrap.innerHTML = `<img src="${src}" alt="">`;
  wrap.classList.add('show');
}

function setCoverState(src, nsfw){
  coverSrc = src || '';
  coverNsfw = !!nsfw;
  document.getElementById('cover-url').value = coverSrc;
  document.getElementById('cover-nsfw').checked = coverNsfw;
  showCoverPreview(coverSrc);
  setUploadStatus('cover-upload-status', '', 'info');
}

/* ---------- adjuntar archivo dentro del contenido ---------- */
let lastCursorPos = null;
let contentField;
let insertPanel;
let linkPanel;

function showInsertPreview(category, data, filename){
  const wrap = document.getElementById('insert-preview');
  if(!data){ wrap.classList.remove('show'); wrap.innerHTML = ''; return; }
  if(category === 'image'){
    wrap.innerHTML = `<img src="${data}" alt="">`;
  }else if(category === 'audio'){
    wrap.innerHTML = `<audio controls src="${data}" style="width:100%;"></audio>`;
  }else if(category === 'text'){
    const snippet = escapeHtml(data.slice(0,600)) + (data.length > 600 ? '…' : '');
    wrap.innerHTML = `<pre class="text-local-preview">${snippet}</pre>`;
  }else{
    wrap.innerHTML = `<div class="file-preview-generic">📄 ${escapeHtml(filename)}</div>`;
  }
  wrap.classList.add('show');
}

function updateNsfwCheckboxVisibility(category){
  const row = document.getElementById('insert-nsfw-row');
  if(!row) return;
  row.style.display = category === 'image' ? 'flex' : 'none';
  if(category !== 'image') document.getElementById('insert-nsfw').checked = false;
}

function initFileInsert(){
  wireImgTabs('insert');
  contentField = document.getElementById('f-content');
  insertPanel = document.getElementById('insertPanel');
  linkPanel = document.getElementById('linkPanel');

  document.getElementById('insert-url').addEventListener('input', (e)=>{
    insertSrc = e.target.value.trim();
    insertCategory = fileCategoryFromPath(insertSrc || '.');
    if(/\.(png|jpe?g|gif|webp|svg)$/i.test(insertSrc)) insertCategory = 'image';
    showInsertPreview(insertCategory, insertSrc, insertSrc.split('/').pop());
    updateNsfwCheckboxVisibility(insertCategory);
  });

  document.getElementById('insert-file').addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const auth = getAuth();
    if(!auth){ alert('Inicia sesión primero.'); return; }

    const category = detectFileCategory(file);
    insertCategory = category;
    updateNsfwCheckboxVisibility(category);

    let localPreview = null;
    if(category === 'text'){
      localPreview = await file.text();
    }else{
      localPreview = await fileToDataUrl(file);
    }
    showInsertPreview(category, localPreview, file.name);
    setUploadStatus('insert-upload-status', `Subiendo ${file.name} a images/ en GitHub...`, 'info');
    insertSrc = '';

    trackUpload((async ()=>{
      try{
        const path = await uploadAssetToGithub(file, auth);
        insertSrc = path;
        setUploadStatus('insert-upload-status', `✔ archivo subido: ${path}`, 'success');
      }catch(err){
        setUploadStatus('insert-upload-status', err.message || 'No se pudo subir el archivo.', 'error');
      }
    })());
  });

  document.getElementById('toggleImgInsert').addEventListener('click', ()=>{
    lastCursorPos = contentField.selectionStart;
    linkPanel.style.display = 'none';
    insertPanel.style.display = insertPanel.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('cancelInsertBtn').addEventListener('click', ()=>{
    insertPanel.style.display = 'none';
  });

  document.getElementById('insertImgBtn').addEventListener('click', ()=>{
    if(!insertSrc){
      alert('Pega una URL o sube un archivo primero.');
      return;
    }
    const alt = document.getElementById('insert-alt').value.trim();
    const isNsfw = insertCategory === 'image' && document.getElementById('insert-nsfw').checked;

    let snippet;
    if(insertCategory === 'image'){
      const altText = isNsfw ? `nsfw:${alt}` : alt;
      snippet = `\n\n![${altText}](${insertSrc})\n\n`;
    }else{
      snippet = `\n\n[archivo:${alt}](${insertSrc})\n\n`;
    }

    insertAtCursor(snippet);

    document.getElementById('insert-url').value = '';
    document.getElementById('insert-file').value = '';
    document.getElementById('insert-alt').value = '';
    document.getElementById('insert-nsfw').checked = false;
    insertSrc = '';
    showInsertPreview(null, null, '');
    setUploadStatus('insert-upload-status', '', 'info');
    insertPanel.style.display = 'none';
    contentField.focus();
  });

  /* ---------- enlaces (YouTube / Twitter / Discord) ---------- */
  document.getElementById('toggleLinkInsert').addEventListener('click', ()=>{
    lastCursorPos = contentField.selectionStart;
    insertPanel.style.display = 'none';
    linkPanel.style.display = linkPanel.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('cancelLinkBtn').addEventListener('click', ()=>{
    linkPanel.style.display = 'none';
  });

  document.getElementById('link-url').addEventListener('input', (e)=>{
    const url = e.target.value.trim();
    const hint = document.getElementById('link-type-hint');
    if(!url){ hint.textContent = 'Pega el enlace para reconocer el tipo automáticamente.'; return; }
    if(getYoutubeId(url)) hint.textContent = '✔ Video de YouTube — se insertará centrado.';
    else if(isTwitterUrl(url)) hint.textContent = '✔ Publicación de Twitter/X.';
    else if(isDiscordInvite(url)) hint.textContent = '✔ Invitación de Discord.';
    else if(getSpotifyEmbed(url)) hint.textContent = '✔ Spotify — se insertará como reproductor.';
    else hint.textContent = 'No lo reconozco como YouTube, Twitter/X, Discord o Spotify — se insertará como texto normal.';
  });

  document.getElementById('insertLinkBtn').addEventListener('click', ()=>{
    const url = document.getElementById('link-url').value.trim();
    if(!url){ alert('Pega un enlace primero.'); return; }
    insertAtCursor(`\n\n${url}\n\n`);
    document.getElementById('link-url').value = '';
    document.getElementById('link-type-hint').textContent = 'Pega el enlace para reconocer el tipo automáticamente.';
    linkPanel.style.display = 'none';
    contentField.focus();
  });
}

function insertAtCursor(snippet){
  const pos = lastCursorPos !== null ? lastCursorPos : contentField.value.length;
  const before = contentField.value.slice(0, pos);
  const after = contentField.value.slice(pos);
  contentField.value = before + snippet + after;
}

/* ---------- texto enriquecido ---------- */
function wrapSelection(prefix, suffix){
  const ta = contentField;
  const start = ta.selectionStart, end = ta.selectionEnd;
  const selected = ta.value.slice(start, end) || 'texto';
  const before = ta.value.slice(0, start);
  const after = ta.value.slice(end);
  ta.value = before + prefix + selected + suffix + after;
  const newPos = start + prefix.length + selected.length + suffix.length;
  ta.focus();
  ta.setSelectionRange(newPos, newPos);
}

function insertHeading(hashes){
  const placeholder = 'Escribe tu título aquí';
  const pos = contentField.selectionStart;
  const before = contentField.value.slice(0, pos);
  const after = contentField.value.slice(pos);
  const prefix = `\n\n${hashes} `;
  contentField.value = before + prefix + placeholder + '\n\n' + after;
  const selStart = before.length + prefix.length;
  const selEnd = selStart + placeholder.length;
  contentField.focus();
  contentField.setSelectionRange(selStart, selEnd);
}

function initFormatToolbar(){
  document.getElementById('fmtBold').addEventListener('click', ()=> wrapSelection('**','**'));
  document.getElementById('fmtUnderline').addEventListener('click', ()=> wrapSelection('__','__'));
  document.getElementById('fmtColor').addEventListener('click', ()=>{
    const color = document.getElementById('fmtColorPicker').value;
    wrapSelection(`[color=${color}]`, '[/color]');
  });
  document.getElementById('fmtHeading').addEventListener('click', ()=> insertHeading('##'));
  document.getElementById('fmtSubheading').addEventListener('click', ()=> insertHeading('###'));
}

function initPostEditor(){
  initCoverPicker();
  initFileInsert();
  initFormatToolbar();
}
