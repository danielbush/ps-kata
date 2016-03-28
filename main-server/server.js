/**
 * @fileOverview Run the main server on selected port.
 * @name server.js<main-server>
 * @author
 * @license BSD 2 Clause
 */

const app = require('./app'),
      port = process.env.NODE_PORT || 4000;

app.listen(port);

console.log(`Agent listening on ${port}`);
