/*
  POST-RENDER.JS
  ----------------------------------------
  Convierte el "content" (texto plano con una sintaxis simple) de un post
  en HTML. Lo usan blog.html, edit-post.html y delete-post.html (para
  vistas previas).

  SINTAXIS DENTRO DE "content" (cada bloque separado por una línea en blanco):
  - Imagen:            ![texto alternativo](ruta)
  - Imagen NSFW:        ![nsfw:texto alternativo](ruta)
  - Archivo:            [archivo](ruta)  o  [archivo:Etiqueta](ruta)
                         (se detecta solo si es audio, texto u otro)
  - Enlace suelto:       https://... (YouTube, Twitter/X o Discord se
                         convierten en video/tweet/tarjeta automáticamente)
  - Texto:              **negrita**, __subrayado__, [color=#hex]texto[/color]
*/

function formatDate(iso){
  const d = new Date(iso + 'T00:00:00');
  const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  return meses[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ---------- detección de enlaces ---------- */
const IMG_LINE = /^!\[(.*?)\]\((.*?)\)$/;
const FILE_LINE = /^\[archivo:?(.*?)\]\((.*?)\)$/i;
const URL_ONLY = /^(https?:\/\/\S+)$/;

const AUDIO_EXT = ['mp3','wav','ogg','m4a','flac','aac','opus'];
const TEXT_EXT = ['txt','md','csv','json','log','yml','yaml','ini','xml'];

function fileCategoryFromPath(path){
  const ext = (path.split('.').pop() || '').toLowerCase();
  if(AUDIO_EXT.includes(ext)) return 'audio';
  if(TEXT_EXT.includes(ext)) return 'text';
  return 'other';
}

function getYoutubeId(url){
  try{
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./,'').replace(/^m\./,'');
    if(host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || null;
    if(host === 'youtube.com'){
      if(u.pathname === '/watch') return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      if(parts[0] === 'embed' || parts[0] === 'shorts') return parts[1] || null;
    }
    return null;
  }catch(e){ return null; }
}

function isTwitterUrl(url){
  try{
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./,'');
    return (host === 'twitter.com' || host === 'x.com') && /\/status\/\d+/.test(u.pathname);
  }catch(e){ return false; }
}

function isDiscordInvite(url){
  try{
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./,'');
    return host === 'discord.gg' || (host === 'discord.com' && u.pathname.startsWith('/invite/'));
  }catch(e){ return false; }
}

/* ---------- texto enriquecido ---------- */
function parseInline(text){
  text = text.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
  text = text.replace(/\[color=(#?[0-9a-zA-Z]+)\]([\s\S]+?)\[\/color\]/g, '<span style="color:$1">$2</span>');
  return text;
}

/* ---------- imágenes (con soporte NSFW) ---------- */
function imageMarkup(src, alt, isNsfw, imgClass, wrapClass, interactive){
  const altAttr = escapeHtml(alt || '');
  if(!isNsfw){
    return `<img class="${imgClass}" src="${src}" alt="${altAttr}">`;
  }
  if(interactive){
    return `<div class="nsfw-wrap ${wrapClass}">
      <img class="nsfw-img" src="${src}" alt="${altAttr}">
      <button type="button" class="nsfw-overlay">
        <span class="nsfw-tag">NSFW</span>
        <span class="nsfw-label">Contenido sensible — toca para mostrar</span>
      </button>
    </div>`;
  }
  return `<div class="nsfw-wrap ${wrapClass} nsfw-static">
    <img class="nsfw-img" src="${src}" alt="${altAttr}">
    <span class="nsfw-static-tag">NSFW</span>
  </div>`;
}

/* ---------- embeds ---------- */
function renderYoutubeEmbed(id){
  return `<div class="embed-block embed-video"><div class="video-frame"><iframe src="https://www.youtube.com/embed/${id}" title="Video de YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div></div>`;
}

function renderTweetEmbed(url){
  return `<div class="embed-block embed-tweet"><blockquote class="twitter-tweet" data-theme="dark"><a href="${url}"></a></blockquote></div>`;
}

function renderDiscordEmbed(url){
  const label = url.replace(/^https?:\/\//,'');
  return `<div class="embed-block embed-discord"><a class="discord-card" href="${url}" target="_blank" rel="noopener">
    <span class="discord-icon">DC</span>
    <span class="discord-text"><strong>Únete al servidor de Discord</strong><span class="discord-sub">${label}</span></span>
  </a></div>`;
}

function loadTwitterWidgets(container){
  if(window.twttr && window.twttr.widgets){
    window.twttr.widgets.load(container);
    return;
  }
  if(document.getElementById('twitter-wjs')) return;
  const s = document.createElement('script');
  s.id = 'twitter-wjs';
  s.src = 'https://platform.twitter.com/widgets.js';
  s.async = true;
  document.body.appendChild(s);
}

/* ---------- archivos (audio / texto / genérico) ---------- */
function renderFileBlock(label, path, pendingTextFiles){
  const category = fileCategoryFromPath(path);
  const displayName = label || path.split('/').pop();

  if(category === 'audio'){
    return `<div class="embed-block embed-audio"><div class="audio-frame">
      ${label ? `<div class="audio-label">${escapeHtml(label)}</div>` : ''}
      <audio controls src="${path}"></audio>
    </div></div>`;
  }

  if(category === 'text'){
    const blockId = 'txt-' + Math.random().toString(36).slice(2);
    if(pendingTextFiles) pendingTextFiles.push({id: blockId, path});
    return `<div class="embed-block embed-textfile"><div class="text-frame">
      <div class="text-frame-head"><span>${escapeHtml(displayName)}</span><a href="${path}" download class="btn btn-sm">DESCARGAR</a></div>
      <pre class="text-frame-body" id="${blockId}">Cargando…</pre>
    </div></div>`;
  }

  const ext = (path.split('.').pop() || 'ARC').toUpperCase().slice(0,4);
  return `<div class="embed-block embed-file"><a class="file-card" href="${path}" target="_blank" rel="noopener" download>
    <span class="file-icon">${ext}</span>
    <span class="file-text"><strong>${escapeHtml(displayName)}</strong><span class="file-sub">${path}</span></span>
  </a></div>`;
}

function loadTextFile(id, path){
  fetch(path).then(r=>{
    if(!r.ok) throw new Error('no ok');
    return r.text();
  }).then(txt=>{
    const el = document.getElementById(id);
    if(el) el.textContent = txt;
  }).catch(()=>{
    const el = document.getElementById(id);
    if(el) el.textContent = '(no se pudo cargar el archivo)';
  });
}

/* ---------- cuerpo completo del post ---------- */
function renderBody(content, pendingTextFiles){
  return content.split(/\n\s*\n/).map(block=>{
    const trimmed = block.trim();

    const imgMatch = trimmed.match(IMG_LINE);
    if(imgMatch){
      let alt = imgMatch[1];
      const src = imgMatch[2];
      let isNsfw = false;
      if(/^nsfw\s*:/i.test(alt)){
        isNsfw = true;
        alt = alt.replace(/^nsfw\s*:\s*/i, '');
      }
      const caption = alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : '';
      return `<figure>${imageMarkup(src, alt, isNsfw, '', 'figure-wrap', true)}${caption}</figure>`;
    }

    const fileMatch = trimmed.match(FILE_LINE);
    if(fileMatch){
      return renderFileBlock(fileMatch[1], fileMatch[2], pendingTextFiles);
    }

    const urlMatch = trimmed.match(URL_ONLY);
    if(urlMatch){
      const url = urlMatch[1];
      const ytId = getYoutubeId(url);
      if(ytId) return renderYoutubeEmbed(ytId);
      if(isTwitterUrl(url)) return renderTweetEmbed(url);
      if(isDiscordInvite(url)) return renderDiscordEmbed(url);
    }

    return `<p>${parseInline(block.replace(/\n/g,'<br>'))}</p>`;
  }).join('');
}

/* ---------- tarjeta de post (lista) ---------- */
function renderPostCardInner(post){
  const coverHtml = post.cover
    ? imageMarkup(post.cover, '', post.coverNsfw, 'pc-cover', 'pc-cover-wrap', false)
    : '';
  return `
    ${coverHtml}
    <div class="pc-inner">
      <div class="pc-top">
        <span class="pc-title">${post.title}</span>
        <span class="pc-date">${formatDate(post.date)}</span>
      </div>
      <div class="pc-excerpt">${post.excerpt}</div>
      <div class="pc-tags">${(post.tags||[]).map(t=>`<span class="pill">${t}</span>`).join('')}</div>
    </div>
  `;
}

/* ---------- delegación de eventos: revelar imágenes NSFW ---------- */
function wireNsfwReveal(container){
  container.addEventListener('click', (e)=>{
    const overlay = e.target.closest('.nsfw-overlay');
    if(overlay){
      overlay.closest('.nsfw-wrap').classList.add('revealed');
    }
  });
}
