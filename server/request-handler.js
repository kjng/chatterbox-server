var fs = require('fs');
var url = require('url');

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

// [messages] stores the server messages and the ones from client in an array
var messages = [
  {
    username: 'server',
    text: 'Welcome to the server!',
    roomname: 'lobby',
    objectId: 1
  }
];
// [messageCount] is the objectId added to each incoming message
var messageCount = 2;

// [addMessage] pushes a provided argument, message, and objectId to the messages array
// and increments the messageCount that keeps track of the object ID
var addMessage = function(message) {
  message.objectId = messageCount;
  messageCount++;
  messages.push(message);
};

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  var statusCode = 200;

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them json.
  headers['Content-Type'] = 'application/json';

  // Serve index.html when client requests '/'
  if (request.method === 'GET' && (url.parse(request.url).pathname === '/')) {
    statusCode = 200;
    headers['Content-Type'] = 'text/html';

    response.writeHead(statusCode, headers);

    fs.readFile('./client/index.html', function(error, data) {
      if (error) {
        throw error;
      }
      response.end(data);
    });
  } else if (request.method === 'OPTIONS' && request.url === '/classes/messages') {
    // Handle OPTIONS request

    statusCode = 200;

    response.writeHead(statusCode, headers);

    response.end();
  } else if (request.method === 'GET' && request.url === '/classes/messages') {
    // Handle GET request

    statusCode = 200;

    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    response.end(JSON.stringify({ results: messages }));
  } else if (request.method === 'POST' && request.url === '/classes/messages') {
    // Handle POST request

    statusCode = 201;


    // [request.on('data')] listens for a 'data' event on request
    // and runs a callback on the data (message) received
    request.on('data', function(message) {
      addMessage(JSON.parse(message));
    });

    response.writeHead(statusCode, headers);

    response.end(JSON.stringify({ results: messages }));
  } else {
    // Return 404 if request is unrecognized or to an unrecognized route
    headers['Content-Type'] = 'plain/text';

    statusCode = 404;

    response.writeHead(statusCode, headers);

    response.end('Your princess is in another castle. (Error 404)');
  }

};

exports.requestHandler = requestHandler;
