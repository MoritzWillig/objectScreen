
NetGate=require("../src/netGate.js");
NetObjectDescriptor=require("../src/netObjectDescriptor.js");

WebSocketServer = require('websocket').server;
WebSocketConnection = require('websocket').connection;
http = require('http');

var connection;
var objects=new Map; //list of objects registered

netConnection={
  send:function (id, msg) {
    if (typeof msg!="string") { throw new Error("message to send was not of type string"); }
    connection.sendUTF(JSON.stringify({
      type:"netGate",
      id:id,
      msg:msg
    }));
  },
  recive:function(callback) {
    netConnection.reciveCb=callback;
  },
  reciveCb:undefined,
  server:true
}
provider=new NetGate(netConnection);

var obj={
  time:(new Date()),
  someProperties:[1,2,3],
  nestedObj:{a:{},b:{c:"Test"}},
  null:null
};
//create some circular references
obj.nestedObj.d=obj;
obj.nestedObj.e=obj;

provideObject(obj);


var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  console.log("origin",origin);
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    connection = request.accept(null, request.origin);
    
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
      switch (message.type) {
      case "utf8":
        var data;
        try {
          data=JSON.parse(message.utf8Data);
        } catch(e) {
          connection.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,"invalid JSON data");
          return;
        }
        
        switch (data.type) {
        case "netGate":
          netConnection.reciveCb(data.id,data.msg);
          break;
        case "client":
          //used for application messages
          break;
        default:
          connection.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,"unknown message type");
        }
        break;
      case "binary":
        connection.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,"no binary data allowed");
        break;
      default:
        connection.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,"unknown message type");
      }
    });
    
    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    
    sendIds();
});

function sendIds() {
  var ids=[];
  objects.forEach(function(val,key) {
    ids.push(val.id);
  });
  
  connection.sendUTF(JSON.stringify({
    type:"client",
    action:"regIds",
    ids:ids
  }));
}

function provideObject(obj,name) {
  if (objects.has(obj)) { return; }
  
  //add object to provider
  provider.produceId(obj,function(id,desc) {
    objects.set(obj,{
      id:id,
      name:name
    });
  },name);
}



