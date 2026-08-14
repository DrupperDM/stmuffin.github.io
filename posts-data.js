/*
  POSTS-DATA.JS
  ----------------------------------------
  Aquí viven todos los posts del blog. blog.html lee este arreglo y
  construye la lista y el detalle de cada entrada automáticamente.

  Para publicar una entrada nueva, la forma normal es entrar a
  new-post.html, iniciar sesión con tu repositorio (usuario/repo) y tu
  token de GitHub, llenar el formulario y darle "PUBLICAR EN GITHUB":
  el commit a este archivo lo hace la propia página. Si prefieres
  hacerlo a mano, ahí mismo puedes copiar el código generado y pegarlo
  dentro del arreglo POSTS de aquí abajo.

  Como el sitio es estático (GitHub Pages), no hay una base de datos
  detrás: este archivo ES la base de datos del blog.

  IMÁGENES
  ----------------------------------------
  Las imágenes NO se guardan en base64 dentro de este archivo — se
  suben como archivos aparte a la carpeta images/ del repositorio, y
  aquí solo se guarda la ruta relativa.
  - Portada (opcional): "cover: 'images/nombre-del-archivo.png'".
    Se muestra en la tarjeta de la lista y arriba del post completo.
  - Imágenes dentro del contenido: escribe una línea así, sola y con
    líneas en blanco antes y después, en cualquier parte de "content":
      ![texto alternativo](images/nombre-del-archivo.png)
  new-post.html sube el archivo a images/ y arma todo esto solo con su
  botón "+ Insertar imagen" — no hace falta escribirlo a mano.
*/

const POSTS = [
  
  
  {
    slug: "fin-de-cubikasmp-temporada-3-muchas-gracias-por-jugar",
    title: "FIN DE CUBIKASMP TEMPORADA 3 - MUCHAS GRACIAS POR JUGAR",
    date: "2026-07-28",
    tags: ["cubikasmp t3"],
    cover: "https://i.imgur.com/2fw5zpY.png",
    excerpt: "CUBIKASMP T3",
    content: "Escribo este post para anunciar el cierre de CubikaSMP TEMPORADA 3, fue una temporada de pruebas y risas, y aunque tuvo sus momentos incomodos, se logró sobrellevar el servidor y se vivieron momentos increibles, gracias por todo."
  }
];
