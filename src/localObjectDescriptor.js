
if ((typeof module!="undefined") && (module.exports)) {
  ObjectDescriptor=require("./objectDescriptor.js");
}

function LocalObjectDescriptor(gate,obj,name) {
  ObjectDescriptor.apply(this,[gate]);
  this.obj=obj;
  this.name=name;
}

LocalObjectDescriptor.prototype=new ObjectDescriptor();

LocalObjectDescriptor.prototype.getAttr=function(name,callback) {
  var attr=this.obj[name];
  if (this.gate.isReference(attr)) {
    var self=this;
    this.gate.getDescriptorByObj(attr,function(desc) {
      if (desc==undefined) {
        self.gate.produceId(attr,function(id,desc) {
          callback(name,desc);
        });
      } else {
        callback(name,desc);
      }
    });
  } else {
    callback(name,attr);
  }
};

/**
 * returns an array of attribute names
**/
LocalObjectDescriptor.prototype.getAttrs=function(callback) {
  var attrs=[];
  for (var attr in this.obj) {
    attrs.push(attr);
  }
  callback(attrs);
};

/**
 * get type of the object (typeof operator)
**/
LocalObjectDescriptor.prototype.getType=function(callback) {
  callback(typeof this.obj);
}

/**
 * get class of the object
**/
LocalObjectDescriptor.prototype.getClass=function(callback) {
  var name=undefined;
  if (this.obj.prototype && this.obj.prototype.constructor) {
    name=this.obj.prototype.constructor.name;
  } else {
    if (this.obj.constructor) {
      name=this.obj.constructor.name;
    }
  }
  
  callback(name);
}


if ((typeof module!="undefined") && (module.exports)) {
  module.exports=LocalObjectDescriptor;
}
