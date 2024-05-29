/*
  - A single instance of Node.js runs in a single thread. To take advantage of multi-core systems, 
    the user will sometimes want to launch a cluster of Node.js processes to handle the load.

  - The cluster module allows easy creation of child processes that all share server ports.
  - 
*/

const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
console.log(numCPUs)

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}