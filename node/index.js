const app = require('express')()
    , fs = require('fs')
    , { EXPRESS_PORT } = require('./config');

require('@babel/polyfill');
require('@babel/register')(JSON.parse(fs.readFileSync('.babelrc')));

require('./middleware')(app);
require('./routes')(app);
require('./module')();

app.listen(EXPRESS_PORT, () => console.log(`backend already listen on port: ${EXPRESS_PORT}`));
