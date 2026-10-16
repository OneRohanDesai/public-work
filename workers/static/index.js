// The existing project browser uses history URLs for project and file views.
// On a direct navigation to those URLs, serve its unchanged HTML shell.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }
    if (url.hostname !== 'rohandesai.in' && url.hostname !== 'www.rohandesai.in') {
      return new Response('Not found', { status: 404 });
    }
    const path = url.pathname;
    const projectView = /^\/projects\/[^/]+(?:\/f\/.+)?\/?$/.test(path);
    const navigation = (request.headers.get('Accept') || '').includes('text/html') ||
      request.headers.get('Sec-Fetch-Mode') === 'navigate';
    if (projectView && navigation) {
      const shell = new URL('/projects/index.html', url);
      let response = await env.ASSETS.fetch(new Request(shell, request));
      // Assets canonicalizes index.html to /projects/. Follow internally so
      // the address bar keeps the selected project and file history URL.
      if ([301, 302, 307, 308].includes(response.status)) {
        const location = response.headers.get('Location');
        if (location) {
          const target = new URL(location, shell);
          if (target.origin === url.origin && target.pathname === '/projects/') {
            response = await env.ASSETS.fetch(new Request(target, request));
          }
        }
      }
      return response;
    }
    return new Response('Not found', { status: 404 });
  }
};
