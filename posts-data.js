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
    slug: "test2",
    title: "test2",
    date: "2026-08-13",
    tags: ["test"],
    cover: "images/1786669368836-image-1.png",
    excerpt: "asdasdasd",
    content: "asdasdasd\n\nhttps://www.youtube.com/watch?v=_XmZBavbsCw\n\n\n\nhttps://discord.gg/zRhHXWYPw\n\n\n\nhttps://x.com/chiZyt0XD/status/2088012066628002303?s=20"
  },
  {
    slug: "test",
    title: "TEST",
    date: "2026-08-13",
    tags: ["test"],
    cover: "images/1786668417990-hnn-xgzxyaa8dbm.jpg",
    excerpt: "UN TEST DE PAGINA",
    content: "ASKAJKSFLKASFASLKFLASFJKLASFLKAFS\n\n![TEST](images/1786668439620-hnn-xgzxyaa8dbm.jpg)"
  },
  {
    slug: "hola-mundo",
    title: "¡Hola, mundo!",
    date: "2026-08-10",
    tags: ["primer-post", "universidad"],
    excerpt: "Primer post del blog. Aquí voy a ir dejando lo que aprendo mientras estudio Ingeniería de Software.",
    content: "Bueno, esto es lo más parecido a un \"hola mundo\" que voy a escribir fuera del código.\n\nLa idea de este blog es simple: ir dejando registro de lo que voy aprendiendo, los proyectos que hago para la carrera (y los que hago por mi cuenta), y algún que otro bug que me haya hecho sufrir más de la cuenta.\n\nNo prometo publicar seguido. Pero aquí queda el primer post."
  },
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
