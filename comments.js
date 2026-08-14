/*
  COMMENTS.JS — integración con GraphComment
  ----------------------------------------
  GraphComment es un sistema de comentarios "de terceros": no necesitas
  levantar tu propio servidor, solo tener una cuenta en
  https://graphcomment.com con tu "graphcommentId" (el shortname de tu
  sitio).
*/

const GRAPHCOMMENT_ID = "STARYMUFFIN";

/*
  mountComments(post)
  Como el blog es una sola página (blog.html) que muestra distintos
  posts según el hash de la URL, cada vez que se abre un post hay que
  reiniciar el widget "desde cero": se limpia el contenedor, se usa el
  "slug" del post como uid (el identificador recomendado por
  GraphComment para separar los hilos de comentarios de cada página) y
  se vuelve a inyectar su script con un parámetro anti-caché, porque
  GraphComment no ofrece una función para "cambiar de hilo" en una
  página que ya cargó.
*/
function mountComments(post){
  const container = document.getElementById('graphcomment');
  if(!container) return;

  container.innerHTML = '';

  const oldScript = document.getElementById('graphcomment-script');
  if(oldScript) oldScript.remove();

  /* - - - CONFIGURATION VARIABLES - - - */
  window.__semio__params = {
    graphcommentId: GRAPHCOMMENT_ID,
    behaviour: {
      uid: post.slug // identificador único del hilo de comentarios de este post
    }
  };
  /* - - - DON'T EDIT BELOW THIS LINE - - - */
  window.__semio__onload = function(){
    window.__semio__gc_graphlogin(window.__semio__params);
  };

  const gc = document.createElement('script');
  gc.id = 'graphcomment-script';
  gc.type = 'text/javascript';
  gc.async = true;
  gc.defer = true;
  gc.onload = window.__semio__onload;
  gc.src = 'https://integration.graphcomment.com/gc_graphlogin.js?' + Date.now();
  (document.head || document.body).appendChild(gc);
}

/* unmountComments() — se llama al salir del detalle de un post */
function unmountComments(){
  const container = document.getElementById('graphcomment');
  if(container) container.innerHTML = '';
  const oldScript = document.getElementById('graphcomment-script');
  if(oldScript) oldScript.remove();
  delete window.__semio__params;
  delete window.__semio__onload;
}
