/* @flow */
import defaults from 'superagent-defaults';
import { url } from '@yssk22/mizuki';

const request = defaults();

request.__baseURL = null;
request.setBaseURL = (url: string) => {
  request.__baseURL = url;
};

request
  .set('x-ajax-request', 'true')
  .type('form') // enforce form in post type
  .timeout({
    response: 30000, // Wait 30 seconds for the server to start sending,
    deadline: 30000 // Allow 30 seconds  for the file to finish loading.
  })
  .on('request', req => {
    if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
      return;
    }
    if (request.__baseURL) {
      req.url = url.join(request.__baseURL, req.url);
    }
  });

export default request;
