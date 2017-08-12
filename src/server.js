// @flow

import http from 'http';

import type {InputType} from './index';
import {handler} from './index';

const port = parseInt(process.env.BABEL_BOT_PORT, 10) || 8001;

http.createServer((request, response) => {
  function writeResponse(code, text) {
    response.writeHead(code, {'Content-Type': 'text/plain'});
    response.end(text);
  }

  if (request.method !== 'POST') {
    writeResponse(405, 'Only POST is allowed.');
    return;
  }

  let body = '';
  request.on('data', data => body += data);
  request.on('end', () => {
    try {
      const input: InputType = {
        data: JSON.parse(body),
        signature: request.headers['x-hub-signature'],
        type: request.headers['x-github-event'],
      };

      // HACK: AWS Lambda makes the callback optional, and there's no way for us
      // to easily determine if the request has finished or not if it doesn't
      // call the callback. Currently the only usage of the callback is to
      // return an error, and it's called synchronously. Therefore, if the
      // callback is not called synchronously, assume it will never be called.
      // Ideally all the handlers should return a promise that resolves when the
      // handler has completed.
      let wasCallbackCalled = false;
      handler(input, {}, (err, result) => {
        wasCallbackCalled = true;
        if (err) {
          writeResponse(500, err.stack);
        } else {
          writeResponse(200, result);
        }
      })
      if (!wasCallbackCalled) {
        writeResponse(200, ':)');
      }
    } catch (err) {
      writeResponse(500, err.stack);
    }
  })
}).listen(port, '0.0.0.0');

console.log(`Server running at http://127.0.0.1:${port}/`);
