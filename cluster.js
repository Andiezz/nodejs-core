/*
  - A single instance of Node.js runs in a single thread. To take advantage of multi-core systems, 
    the user will sometimes want to launch a cluster of Node.js processes to handle the load.

  - The cluster module allows easy creation of child processes that all share server ports.
  
  HOW IT WORKS:
    - The worker processes are spawned using the child_process.fork()
      + communicate with the parent via IPC and pass server handles back and forth.
    
    - 2 methods of distributing incoming connections:
      + The 'round-robin' approach, where the server listens on a port, accepts new connections and distributes them across the workers in a round-robin fashion.
      + Master process creates the listen socket and sends it to interested workers. The workers then accept incoming connections directly.
*/

// const cluster = require('cluster');
// const http = require('http');
// const numCPUs = require('os').cpus().length;
// console.log(numCPUs)

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Fork workers.
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`worker ${worker.process.pid} died`);
//   });
// } else {
//   // Workers can share any TCP connection
//   // In this case it is an HTTP server
//   // Running Node.js will now share port 8000 between the workers:
//   http.createServer((req, res) => {
//     res.writeHead(200);
//     res.end('hello world\n');
//   }).listen(8000);

//   console.log(`Worker ${process.pid} started`);
// }

const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {

  // Keep track of http requests
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  // Count requests
  function messageHandler(msg) {
    console.log(msg);
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  // Start workers and listen for messages containing notifyRequest
  const numCPUs = require('os').cpus().length;
  console.log(numCPUs);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler);
  }

} else {

  // Worker processes have a http server.
  http.Server((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');

    // Notify master about the request
    process.send({ cmd: 'notifyRequest', worker: process.pid });
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}