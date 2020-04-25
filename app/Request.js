const https = require('https');

exports.get = options => {
  options = typeof options == 'object' ? options : {};
  options.method = 'GET';
  options.port = 443;

  return new Promise((resolve, reject) => {
    https.get(options, (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(JSON.parse(data));
      });

    }).on("error", (err) => {
      reject(err);
    });
  });

};