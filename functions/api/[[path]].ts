export async function onRequest(context: any) {
  const url = new URL(context.request.url);

  const workerUrl =
    `https://mining-portfolio-worker.engineerdaniel.workers.dev${url.pathname}${url.search}`;

  return fetch(workerUrl, context.request);
}
