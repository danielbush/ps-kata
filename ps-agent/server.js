/**
 * @fileOverview Run the agent on port 3000.
 * @name server.js<ps-agent>
 * @author 
 * @license BSD 2 Clause
 */

const app = require('./app');

app.listen(3000);

console.log('Agent listening on 3000');
