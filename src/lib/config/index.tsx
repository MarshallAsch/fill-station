

import nconf from "nconf-esm";
import {safeLoad,safeDump } from "js-yaml";
import path from 'path';

 nconf
  .use('memory')
  .argv({parseValues: true})
  .env({lowerCase: true, parseValues: true})
  .file('container', {
      file: path.join('/config', 'config.yaml'),
      format: {
        parse: safeLoad,
        stringify: safeDump,
      }
  })
  .file('local', {
      file: path.join( __dirname, '..', '..', '..', 'config.yaml'),
      format: {
        parse: safeLoad,
        stringify: safeDump,
      }
  })
  .defaults({
  database: {
    host: 'localhost',
    database: 'fills',
    username: 'fills',
    password: 'fills'
  }
});

export default nconf;
