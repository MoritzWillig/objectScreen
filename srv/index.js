
NetGate=require("../src/netGate.js");
NetObjectDescriptor=require("../src/netObjectDescriptor.js");

WebSocketServer = require('websocket').server;
WebSocketConnection = require('websocket').connection;
http = require('http');



ObjectScreenServer=function ObjectScreenServer(address) {
  this.objects=new Map();
  
  self=this;
  this.netConnection={
    send:function (id, msg) {
      if (typeof msg!="string") { throw new Error("message to send was not of type string"); }
      self.connection.sendUTF(JSON.stringify({
        type:"netGate",
        id:id,
        msg:msg
      }));
    },
    recive:function(callback) {
      self.netConnection.reciveCb=callback;
    },
    reciveCb:undefined,
    server:true
  }
  this.provider=new NetGate(this.netConnection);
  
  this.server=http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });
  
  this.server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
  });

  this.wsServer = new WebSocketServer({
    httpServer: this.server,
    autoAcceptConnections: false
  });

  this.wsServer.on('request', function(request) {
    if (!self.originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    self.connection=request.accept(null, request.origin);
    
    console.log((new Date()) + ' Connection accepted.');
    self.connection.on('message', function(message) {
      switch (message.type) {
      case "utf8":
        var data;
        try {
          data=JSON.parse(message.utf8Data);
        } catch(e) {
          self.connection.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,"invalid JSON data");
          return;
        }
        
        switch (data.type) {
        case "netGate":
          self.netConnection.reciveCb(data.id,data.msg);
          break;
        case "client":
          //used for application messages
        default:
          self.connection.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,"unknown message type");
        }
        break;
      case "binary":
        self.connection.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,"no binary data allowed");
        break;
      default:
        self.connection.drop(WebSocketConnection.CLOSE_REASON_INVALID_DATA,"unknown message type");
      }
    });
    
    self.connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + self.connection.remoteAddress + ' disconnected.');
    });
    
    self.sendIds();
  });
}

ObjectScreenServer.prototype.connection;
ObjectScreenServer.prototype.objects;//list of objects registered
ObjectScreenServer.prototype.netConnection;
ObjectScreenServer.prototype.provider;
ObjectScreenServer.prototype.server;
ObjectScreenServer.prototype.wsServer;

/**
 * displays the given object on connected clients
 * @param  {*} object object to be displayed
 * @param  {string} [name]  name of the object
 */
ObjectScreenServer.prototype.provideObject=function provideObject(object,name) {
  if (this.objects.has(obj)) { return; }
  
  //add object to provider
  this.provider.produceId(obj,function(id,desc) {
    this.objects.set(obj,{
      id:id,
      name:name
    });
  },name);
}

ObjectScreenServer.prototype.sendIds=function sendIds() {
  var ids=[];
  this.objects.forEach(function(val,key) {
    ids.push(val.id);
  });
  
  this.connection.sendUTF(JSON.stringify({
    type:"client",
    action:"regIds",
    ids:ids
  }));
}

ObjectScreenServer.prototype.originIsAllowed=function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  console.log("origin",origin);
  return true;
}




if ((typeof module!="undefined") && (module.exports)) {
  module.exports=ObjectScreenServer;
} else {
  //stand-alone test server
  srv=new ObjectScreenServer("127.0.0.1");

  //create test object
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
}

