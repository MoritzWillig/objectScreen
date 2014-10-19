
if ((typeof module!="undefined") && (module.exports)) {
  Gate=require("./gate.js");
  ObjectDescriptor=require("./localObjectDescriptor.js");
  IdFactory=require("./idFactory");
}

function LocalGate() {
  this.ids=new Map();
  this.obj=new Map();
  this.desc=new Map();
  this.idf=new IdFactory();
}

LocalGate.prototype=new Gate();

/**
 * saves a new object under the given id
 * @returns ObjectDescriptor
 * @throws String if object is already registered
**/
LocalGate.prototype.acceptId=function(id,object,callback,name) {
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
LocalGate.prototype.produceId=function(obj,callback,name) {
  var id=this.idf.newId();
  this.acceptId(id,obj,callback,name);
}

LocalGate.prototype.getId=function(obj) {
  return this.obj.get(obj);
}

LocalGate.prototype.getIdByDescriptor=function(descriptor) {
  return this.desc.get(descriptor);
}

LocalGate.prototype.hasId=function(id) {
  return (this.ids.get(id)!=undefined);
}

LocalGate.prototype.getDescriptorById=function(id,callback) {
  var desc=this.ids.get(id);
  if (desc==undefined) {
    throw new Error("id "+id+" is not registered");
  } else {
    callback(desc);
  }
}

LocalGate.prototype.getDescriptorByObj=function(obj,callback) {
  var id=this.getId(obj);
  if (id==undefined) {
    callback(undefined);
  } else {
    callback(this.ids.get(id));
  }
}


if ((typeof module!="undefined") && (module.exports)) {
  module.exports=LocalGate;
}
