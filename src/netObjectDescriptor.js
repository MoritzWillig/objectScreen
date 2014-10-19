
if ((typeof module!="undefined") && (module.exports)) {
  ObjectDescriptor=require("./objectDescriptor.js");
}

function NetObjectDescriptor(gate,remoteId,name) {
  ObjectDescriptor.apply(this,[gate]);
  this.remoteId=remoteId;
  this.name=name;
}

NetObjectDescriptor.prototype=new ObjectDescriptor();

NetObjectDescriptor.prototype.getAttr=function(name,callback) {
  var self=this;
  this.gate.requestRemote(this.remoteId,"getAttr",{name:name},function(err, data) {
    if (err) { throw new Error("getAttr: "+err); }
    
    if (data.descriptorId!=undefined) {
      if (self.gate.hasId(data.descriptorId)) {
        //get existing descriptor
        self.gate.getDescriptorById(data.descriptorId,function(desc) {
          callback(name,desc);
        });
      } else {
        //create & accept remote descriptor
        var desc=new NetObjectDescriptor(self.gate,data.descriptorId,data.name);
        
        self.gate.acceptIdNet(data.descriptorId,function(id,desc) {
          callback(name,desc);
        },data.name);
      }
    } else {
      callback(name,data.val);
    }
  });
};

/**
 * returns an array of attribute names
**/
NetObjectDescriptor.prototype.getAttrs=function(callback) {
  this.gate.requestRemote(this.remoteId,"getAttrs",undefined,function(err, data) {
    if (err) { throw new Error("getAttr: "+err); }
    
    callback(data.attrs);
  });
};

/**
 * get type of the object (typeof operator)
**/
NetObjectDescriptor.prototype.getType=function(callback) {
  callback("object");
}

/**
 * get class of the object
**/
NetObjectDescriptor.prototype.getClass=function(callback) {
  this.gate.requestRemote(this.remoteId,"getClass",undefined,function(err, data) {
    if (err) { throw new Error("getClass: "+err); }
    
    callback(data.name);
  });
}

if ((typeof module!="undefined") && (module.exports)) {
  module.exports=NetObjectDescriptor;
}

