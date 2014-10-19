
function Gate() {}

Gate.prototype.acceptId=function(id,obj,callback) {
  throw new Error("acceptId is not implemented");
}

Gate.prototype.produceId=function(obj,callback) {
  throw new Error("produceId is not implemented");
}

Gate.prototype.getId=function(obj) {
  throw new Error("getId is not implemented");
}

Gate.prototype.getIdByDescriptor=function(obj) {
  throw new Error("getIdByDescriptor is not implemented");
}

Gate.prototype.hasId=function(id) {
  throw new Error("hasId not implemented");
}

Gate.prototype.getDescriptorById=function(obj,callback) {
  throw new Error("getDescriptorById is not implemented");
}

Gate.prototype.getDescriptorByObj=function(obj,callback) {
  throw new Error("getDescriptorByObj is not implemented");
}

Gate.prototype.isReference=function(val) {
  return ((typeof val=="object") && (val!=null));
}


if ((typeof module!="undefined") && (module.exports)) {
  module.exports=Gate;
}
