/**
 * @fileOverview Run the agent on selected port.
 * @name server.js<ps-agent>
 * @author 
 * @license BSD 2 Clause
 */

const app = require('./app'),
      port = process.env.NODE_PORT || 4000;

app.listen(port);

console.log(`Agent listening on ${port}`);
