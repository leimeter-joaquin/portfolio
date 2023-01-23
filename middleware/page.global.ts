export default defineNuxtRouteMiddleware((to, from) => {
  const getRouteIndex = (path: string) => {
    switch (path) {
      case "/":
        return 0;
      case "/projects":
        return 1;
      case "roadmap":
        return 2;
      default:
        return 0;
    }
  };

  const fromIndex = getRouteIndex(from.path);
  const toIndex = getRouteIndex(to.path);

  if (toIndex > fromIndex) {
    to.meta.pageTransition = { name: "page-left" };
    from.meta.pageTransition = { name: "page-left" };
  } else {
    to.meta.pageTransition = { name: "page-right" };
    from.meta.pageTransition = { name: "page-right" };
  }
});
