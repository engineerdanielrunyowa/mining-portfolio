export async function onRequest(context: any) {
  const url = new URL(context.request.url);

  const workerUrl =
    `https://portfolio-api.engineerdanielrunyowa.workers.dev${url.pathname}${url.search}`;

  return fetch(workerUrl, context.request);
}
