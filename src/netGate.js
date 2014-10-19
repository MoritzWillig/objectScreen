
if ((typeof module!="undefined") && (module.exports)) {
  Gate=require("./gate.js");
  NetDescriptor=require("./netObjectDescriptor.js");
  LocalObjectDescriptor=require("./localObjectDescriptor.js");
  IdFactory=require("./idFactory");
}

if (!Map.prototype.forEach) {
  var nativeMap=Map;
  
  Map=function(iterable) {
    this.nMap=new nativeMap(iterable);
    this.hKeys=[];
  }
  Map.prototype.get=function get(key) {
    return this.nMap.get(key);
  }
  Map.prototype.set=function set(key,value) {
    var has=this.has(key);
    this.nMap.set(key,value);
    if (!has) {
      this.hKeys.push(key);
    }
    return this;
  }
  Map.prototype.clear=function clear() {
    this.nMap.clear();
    this.hKeys=[];
    return this;
  }
  Map.prototype.delete=function del(key) {
    var has=this.has(key);
    this.nMap.delete(key);
    if (has) {
      var idx=this.hKeys.indexOf(key);
      this.hKeys.splice(idx,1);
    }
    return this;
  }
  Map.prototype.has=function has(key) {
    return this.nMap.has(key);
  }
  Object.defineProperty(Map.prototype,"size",{
    get:function() {
      return this.nMap.size;
    }
  });
  
  Map.prototype.forEach=function forEach(callbackFn) {
    for (var i in this.hKeys) {
      var key=this.hKeys[i];
      callbackFn(this.get(key),key,this);
    }
    return this;
  }
}

/**
 * connection has to provide: { send(* id, string msg), recive(callback(* id, string str)), bool server }
**/
function NetGate(connection) {
  this.ids=new Map();
  this.obj=new Map();
  this.desc=new Map();
  
  //get unique ids
  this.idf=new IdFactory((connection.server?"d":"c")+(+new Date())+"_");
  //id factory for connection ids
  this.idfConn=new IdFactory((connection.server?"d":"c")+"_");
  this.connections={}; //active connections
  
  this.connection=connection;
  var self=this;
  this.connection.recive(function() {
    self.handleRequests.apply(self,arguments);
  });
}

NetGate.prototype=new Gate();
NetGate.prototype.requestTimeout=10000;


/**
 * saves a new object under the given id
 * @returns ObjectDescriptor
 * @throws String if object is already registered
**/
NetGate.prototype.acceptId=function(id,object,callback,name) {
  if (this.ids.get(id)!=undefined) {
    throw new Error("id "+id+" is already in use");
  } else {
    if (this.obj.get(object)!=undefined) {
      throw new Error("object is already used");
    } else {
      var od=new LocalObjectDescriptor(this,object,name);
      this.ids.set(id,od);
      this.obj.set(object,id);
      this.desc.set(od,id);
      
      callback(id,od);
    }
  }
};

/**
 * creates an id for a new object
**/
NetGate.prototype.produceId=function(obj,callback,name) {
  var id=this.idf.newId();
  this.acceptId(id,obj,callback,name);
}

NetGate.prototype.getId=function(obj) {
  return this.obj.get(obj);
}

NetGate.prototype.getIdByDescriptor=function(descriptor) {
  return this.desc.get(descriptor);
}

NetGate.prototype.hasId=function(id) {
  return (this.ids.get(id)!=undefined);
}

NetGate.prototype.getDescriptorById=function(id,callback) {
  var desc=this.ids.get(id);
  if (desc==undefined) {
    throw new Error("id "+id+" is not registered");
  } else {
    callback(desc);
  }
}

NetGate.prototype.getDescriptorByObj=function(obj,callback) {
  var id=this.getId(obj);
  if (id==undefined) {
    callback(undefined);
  } else {
    callback(this.ids.get(id));
  }
}

/*
 provider functions
*/

NetGate.prototype.handleRequests=function(connectionId, str) {
  //console.log("recived request data",str);
  var data=JSON.parse(str);
  
  var self=this;
  switch (data.type) {
  case "response":
    var connection=this.connections[connectionId];
    if (!connection) {
      console.log("recived invalid connection id");
      return;
    }
    
    connection.callback(connectionId,str);
    break;
  case "request":
    this.getDescriptorById(data.id,function(desc) {
      switch (data.action) {
      case "getAttr":
        desc.getAttr(data.data.name,function(name,val) {
          var isDesc=(val instanceof ObjectDescriptor);
          if (isDesc) {
            desc.getType(function(type) {
              self.responseRemote(connectionId,data.id,{
                descriptorId:self.desc.get(val),
                type:type,
                name:desc.name
              });
            });
          } else {
            self.responseRemote(connectionId,data.id,{
              val:val
            });
          }
        });
        break;
      case "getAttrs":
        desc.getAttrs(function(attrs) {
          self.responseRemote(connectionId,data.id,{
            attrs:attrs
          });
        });
        break;
      case "getClass":
        desc.getClass(function(name) {
          self.responseRemote(connectionId,data.id,{
            name:name
          });
        });
      default:
        throw new Error("invalid action "+data.action);
      }
    });
    break;
  default:
    throw new Error("invalid message type "+data.type);
  }
}

/**
 * @param callback (err,[{* id,str action,* data}])
**/
NetGate.prototype.requestRemote=function(itemId,action,data,callback) {
  var str=JSON.stringify({
    type:"request",
    id:itemId,
    action:action,
    data:data
  });
  
  var id=this.idfConn.newId();
  var self=this;
  this.connections[id]={
    timer:setTimeout(function() {
      self.clearConnection(id);
      callback("request "+id+" timed out");
    },this.requestTimeout),
    callback:function(id,str) {
      if (self.connections[id]) {
        self.clearConnection(id);
        
        var data; //console.log("data",str);
        try {
          data=JSON.parse(str);
        } catch(e) {
          callback("remote callback returned invalid json");
          return;
        }
        callback(undefined,data.data);
      }
    }
  };
  
  this.connection.send(id,str);
};

NetGate.prototype.responseRemote=function(connectionId,itemId,data) {
  var str=JSON.stringify({
    type:"response",
    id:itemId,
    data:data
  });
  this.connection.send(connectionId,str);
}


NetGate.prototype.clearConnection=function(id) {
  var connection=this.connections[id];
  if (!connection) {
    throw new Error("connection was not registered");
  }
  
  clearTimeout(connection.timer);
  delete this.connections[id];
};

NetGate.prototype.acceptIdNet=function(id,callback,name) {
  if (this.ids.get(id)!=undefined) {
    throw new Error("id "+id+" is already in use");
  } else {
    var od=new NetObjectDescriptor(this,id,name);
    this.ids.set(id,od);
    this.desc.set(od,id);
    callback(id,od);
  }
};



if ((typeof module!="undefined") && (module.exports)) {
  module.exports=NetGate;
}
