
function ObjectDescriptor(gate) {
  this.gate=gate;
};

/**
 * returns the value of an given attribute (if the value is a reference an ObjectDescriptor is returned)
 * @param name string name of attribute
 * @param callback function returns (string name, Descriptor/nonRefValue attr)
**/
ObjectDescriptor.prototype.getAttr=function(name,callback) {
  throw new Error("getAttr is not implemented");
};
/**
 * returns an array of attribute names
**/
ObjectDescriptor.prototype.getAttrs=function(callback) {
  throw new Error("getAttrs is not implemented");
};
/**
 * get type of the object (typeof operator)
**/
ObjectDescriptor.prototype.getType=function(callback) {
  throw new Error("getType is not implemented");
}
/**
 * get class of the object
**/
ObjectDescriptor.prototype.getClass=function(callback) {
  throw new Error("getClass is not implemented");
}


if ((typeof module!="undefined") && (module.exports)) {
  module.exports=ObjectDescriptor;
}
