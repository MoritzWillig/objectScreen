
dest=undefined;
reciver=undefined;

function connectReciver() {
  reciver=provider;
}

var websocket;
var netConnection=({
  send:function (id, msg) {
    var data={
      type:"netGate",
      id:id,
      msg:msg
    };
    //console.log("sending","connection id:",id,"data:",data);
    websocket.send(JSON.stringify(data));
  },
  recive:function(callback) {
    netConnection.reciveCb=callback;
  },
  reciveCb:undefined,
  server:false
});

var websocket_CLOSE_UNSUPPORTED=1003;

function connectNetworkReciver(address) {
  console.log("connectiong to",address);
  
  websocket=new WebSocket(address);
  websocket.addEventListener("open",function(e) {
    console.log("ws open",e);
  });
  websocket.addEventListener("close",function(e) {
    console.log("ws close",e.code,e.reason,e.wasClean);
  });
  websocket.addEventListener("error",function(e) {
    console.log("ws error",e);
  });
  websocket.addEventListener("message",function(e) {
    var data=e.data;
    if (typeof data!="string") {
      websocket.close(websocket_CLOSE_UNSUPPORTED,"data type "+typeof data+" is not supported");
    }
    
    try {
      data=JSON.parse(data);
    } catch(e) {
      websocket.close(websocket_CLOSE_UNSUPPORTED,"no valid json data");
      return;
    }
    //console.log("reciving","data:",data);
    
    switch (data.type) {
    case "netGate":
      netConnection.reciveCb(data.id,data.msg);
      break;
    case "client":
      switch (data.action) {
      case "regIds":
        for (var i in data.ids) {
          var id=data.ids[i];
          
          reciver.acceptIdNet(id,function(id,descriptor) {
            displayDescriptor(descriptor,undefined,function() {
              var idx=descriptors.indexOf(descriptor);
              structTree(sObjects[idx],-1);
            });
          },id.name);
        }
        break;
      default:
        console.log("invalid client message action",data.action);
        break;
      }
      break;
    default:
      console.log("invalid message type",data.type);
    }
  });
  
  reciver=new NetGate(netConnection);
}


function netOnNewId(id) {
  //the provider can now deliver obj, get descriptor from reciver
  reciver.getDescriptorById(id,function(descriptor) {
    displayDescriptor(descriptor);

    var idx=descriptors.indexOf(descriptor);
    structTree(sObjects[idx],-1);
  });
}