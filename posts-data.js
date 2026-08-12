/*
  POSTS-DATA.JS
  ----------------------------------------
  Aquí viven todos los posts del blog. blog.html lee este arreglo y
  construye la lista y el detalle de cada entrada automáticamente.

  Para publicar una entrada nueva:
  1. Abre new-post.html, llena el formulario y dale a "Generar entrada".
  2. Copia el objeto que te genera.
  3. Pégalo dentro del arreglo POSTS de aquí abajo (como un elemento más).
  4. Guarda este archivo y sube los cambios a GitHub.

  Como el sitio es estático (GitHub Pages), no hay una base de datos
  detrás: este archivo ES la base de datos del blog.
*/

const POSTS = [
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
  },
  {
    slug: "primer-semestre",
    title: "Sobreviviendo el primer semestre",
    date: "2026-06-02",
    tags: ["universidad"],
    excerpt: "Algunas cosas que aprendí (a las malas) sobre organizarme, entregar proyectos y no dormir solo 3 horas antes de un examen.",
    content: "El primer semestre fue una montaña rusa. Entre materias que no sabía que existían y proyectos que aparecían de la nada, terminé aprendiendo más sobre organizarme que sobre código.\n\nAlgunas cosas que me sirvieron:\n\n- Anotar TODO, aunque sienta que me voy a acordar\n- Empezar los proyectos apenas los asignan, no la semana antes\n- Aceptar que un error de sintaxis me va a robar 40 minutos de vida tarde o temprano\n\nY sí, dormí muy poco antes de más de un examen. Trabajando en eso."
  }
];
