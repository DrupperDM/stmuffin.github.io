/*
  FONT-DETECT.JS
  ----------------------------------------
  El navegador puede confirmar si una fuente específica realmente
  cargó (a diferencia de estar usando el respaldo Press Start 2P o el
  genérico monospace). Si "Determination Sans" sí está disponible,
  agrega la clase "has-determination-sans" al <html> — el CSS usa esa
  clase para agrandar un poco el texto de lectura, porque el diseño
  original de esa fuente es visualmente más chico que Press Start 2P
  al mismo tamaño en px.

  Si el texto de tu sitio se ve con una tipografía "normal" (no
  pixelada ni con Press Start 2P), lo más probable es que:
  - Todavía no subiste los archivos de Determination Sans a fonts/, o
  - Estás abriendo el HTML directo desde tu computadora (doble clic)
    en vez de servirlo por GitHub Pages o un servidor local, y el
    navegador bloqueó la carga de Google Fonts (Press Start 2P) por
    política de archivos locales.
  Prueba viéndolo ya subido a GitHub Pages para descartar el segundo caso.
*/
(function(){
  function applyFontClass(){
    try{
      if(document.fonts && document.fonts.check && document.fonts.check("24px 'Determination Sans'")){
        document.documentElement.classList.add('has-determination-sans');
      }
    }catch(e){
      // si la API no está disponible, simplemente no se agranda nada
    }
  }

  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(applyFontClass);
  }else{
    window.addEventListener('load', applyFontClass);
  }
})();
