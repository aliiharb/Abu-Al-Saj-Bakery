import serverless from 'serverless-http';

let cachedHandler;

export const handler = async (event, context) => {
  if (!cachedHandler) {
    process.env.NETLIFY = process.env.NETLIFY || 'true';

    const serverModule = await import('../../server/src/index.js');

    const app = serverModule.default || serverModule.app || serverModule;

    if (!app || typeof app !== 'function') {
      console.error('Express app import failed:', Object.keys(serverModule));
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Express app was not exported correctly'
        })
      };
    }

    cachedHandler = serverless(app);
  }

  return cachedHandler(event, context);
};
