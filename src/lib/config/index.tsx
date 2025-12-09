

import nconf from "nconf-esm";
import {safeLoad,safeDump } from "js-yaml";

 nconf
  .use('memory')
  .argv({parseValues: true})
   .env({lowerCase: true, parseValues: true})
   .file({
      file: __dirname + '../../../application.yml',
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
