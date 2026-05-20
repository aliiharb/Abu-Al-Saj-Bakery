import serverless from 'serverless-http';

process.env.NETLIFY = process.env.NETLIFY || 'true';

const { default: app } = await import('../../server/src/index.js');
const serverlessHandler = serverless(app);

export const handler = (event, context) => {
  const normalizedEvent = { ...event };

  if (normalizedEvent.path?.startsWith('/.netlify/functions/api')) {
    const suffix = normalizedEvent.path.slice('/.netlify/functions/api'.length);
    normalizedEvent.path = `/api${suffix}`;
  }

  if (normalizedEvent.rawUrl?.includes('/.netlify/functions/api')) {
    normalizedEvent.rawUrl = normalizedEvent.rawUrl.replace('/.netlify/functions/api', '/api');
  }

  return serverlessHandler(normalizedEvent, context);
};
