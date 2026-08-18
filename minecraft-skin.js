/*
  MINECRAFT-SKIN.JS
  ----------------------------------------
  Visor 3D de tu skin actual + galería de tus últimas skins.

  IMPORTANTE — sé honesto sobre esto:
  Mojang NO tiene una API pública de "historial de skins". Solo se puede
  consultar la skin ACTUAL de una cuenta (por username o UUID). Por eso:

  - "MI SKIN ACTUAL" se resuelve sola: pones tu UUID o tu username abajo
    y el visor 3D la carga automáticamente. Prueba varios proveedores
    (mc-heads, minotar, crafatar) en orden y usa el primero que responda,
    así que si uno está caído no se rompe todo.
  - "ÚLTIMAS SKINS" NO se puede traer sola de tu cuenta — la vas
    llenando tú a mano en recentSkins de aquí abajo. Cada vez que
    cambies de skin, guarda el archivo .png (Minecraft lo guarda
    localmente, o descárgalo con cualquier visor de skins) y súbelo a
    la carpeta images/ de tu repo (puedes usar new-post.html como
    subidor rápido, o arrastrarlo directo en GitHub), y agrega la ruta
    aquí.

  Recomendado: usa tu UUID en vez de tu username — es más confiable
  porque no depende de un segundo request para resolverlo.
  Para encontrar tu UUID: https://mcuuid.net/
*/

const MINECRAFT_CONFIG = {
  currentUuid: '', // ej: '069a79f4-44e9-4726-a5be-fca90e38aaf5' (con o sin guiones)
  currentUsername: 'StaryMuffin', // se usa solo si currentUuid está vacío

  recentSkins: [
    // Cada entrada admite:
    //   skin: ruta a un PNG que subiste tú (para skins que ya no están activas)
    //   uuid: si esa skin sigue siendo la actual de algún UUID
    // { label: 'Skin de verano', date: '2026-06', skin: 'images/skin-verano.png' },
  ]
};

async function firstWorkingImageUrl(candidateBaseUrls){
  for(const base of candidateBaseUrls){
    const testUrl = base + (base.includes('?') ? '&' : '?') + 'v=' + Date.now();
    try{
      const res = await fetch(testUrl, { method: 'GET', mode: 'cors', cache: 'no-store' });
      if(res.ok) return testUrl;
    }catch(e){
      // este proveedor falló (caído, CORS, lo que sea) — se prueba el siguiente
    }
  }
  return null;
}

async function resolveMinecraftSkinUrl(uuidRaw, username){
  const identifier = (uuidRaw || '').replace(/-/g,'').trim() || (username || '').trim();

  if(!identifier){
    return { error: 'Falta configurar tu UUID o username en minecraft-skin.js.' };
  }

  // Varios proveedores conocidos que aceptan username o UUID directamente.
  // Si uno está caído (pasa de vez en cuando, son servicios gratuitos),
  // se prueba el siguiente automáticamente.
  const candidates = [
    `https://mc-heads.net/skin/${identifier}`,
    `https://minotar.net/skin/${identifier}`,
    `https://crafatar.com/skins/${identifier}`,
  ];

  const working = await firstWorkingImageUrl(candidates);
  if(!working){
    return { error: 'No pude cargar tu skin desde ningún proveedor (probé varios). Puede ser un corte temporal de esos servicios — intenta de nuevo en un rato, o revisa que tu username/UUID esté bien escrito.' };
  }

  return { url: working };
}

async function initMinecraftSkinViewer(){
  const canvas = document.getElementById('mc-canvas');
  const statusEl = document.getElementById('mc-status');
  const grid = document.getElementById('mc-recent-grid');
  if(!canvas) return;

  const result = await resolveMinecraftSkinUrl(MINECRAFT_CONFIG.currentUuid, MINECRAFT_CONFIG.currentUsername);

  if(result.error){
    if(statusEl){
      statusEl.textContent = result.error;
      statusEl.className = 'upload-status error';
    }
  }else{
    const viewer = new skinview3d.SkinViewer({
      canvas,
      width: 300,
      height: 380,
      skin: result.url
    });
    viewer.autoRotate = true;
    viewer.autoRotateSpeed = 0.6;
    viewer.animation = new skinview3d.WalkingAnimation();
    viewer.zoom = 0.85;
    if(statusEl){ statusEl.textContent = ''; statusEl.className = 'upload-status'; }

    if(grid){
      grid.addEventListener('click', (e)=>{
        const card = e.target.closest('.mc-recent-card');
        if(!card || !card.dataset.skin) return;
        viewer.loadSkin(card.dataset.skin);
        window.scrollTo({top: canvas.getBoundingClientRect().top + window.scrollY - 100, behavior:'smooth'});
      });
    }
  }

  if(grid){
    const entries = MINECRAFT_CONFIG.recentSkins.slice(0,5);
    if(entries.length === 0){
      grid.innerHTML = '<div class="empty-note">* agrega tus skins anteriores en minecraft-skin.js</div>';
      return;
    }
    grid.innerHTML = '';
    entries.forEach(entry=>{
      let thumbUrl = entry.skin;
      let swapUrl = entry.skin;
      let fallbackThumb = '';
      if(!thumbUrl && entry.uuid){
        const cleanUuid = entry.uuid.replace(/-/g,'');
        thumbUrl = `https://mc-heads.net/body/${cleanUuid}/40`;
        fallbackThumb = `https://crafatar.com/renders/body/${cleanUuid}?scale=6&overlay`;
        swapUrl = `https://mc-heads.net/skin/${cleanUuid}`;
      }
      if(!thumbUrl) return;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mc-recent-card';
      card.dataset.skin = swapUrl;
      card.innerHTML = `
        <img src="${thumbUrl}" alt="${entry.label || 'skin anterior'}" ${fallbackThumb ? `onerror="this.onerror=null;this.src='${fallbackThumb}';"` : ''}>
        <span class="mc-recent-label">${entry.label || 'Sin nombre'}</span>
        ${entry.date ? `<span class="mc-recent-date">${entry.date}</span>` : ''}
      `;
      grid.appendChild(card);
    });
  }
}

if(window.skinview3d){
  initMinecraftSkinViewer();
}else{
  window.addEventListener('skinview3d-ready', initMinecraftSkinViewer, { once: true });
}
initMinecraftSkinViewer();
