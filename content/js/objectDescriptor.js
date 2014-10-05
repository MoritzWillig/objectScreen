

function ObjectDescriptor(gate) {
  this.gate=gate;
};

/**
 * returns the value of an given attribute (if value is an reference an ObjectDescriptor is returned)
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





function LocalObjectDescriptor(gate,obj,name) {
  ObjectDescriptor.apply(this,[gate]);
  this.obj=obj;
  this.name=name;
}

LocalObjectDescriptor.prototype=new ObjectDescriptor();

LocalObjectDescriptor.prototype.getAttr=function(name,callback) {
  var attr=this.obj[name];
  var to=typeof attr;
  if ((to=="object") && (attr!=null)) {
    var self=this;
    this.gate.getDescriptorByObj(attr,function(desc) {
      if (desc==undefined) {
        self.gate.getDescriptorByDescrAttr(self,name,function(descriptor,parent,attrName) {
          callback(name,descriptor);
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
  callback(this.constructor.name);
}





function Gate() {}

Gate.prototype.acceptId=function(id,obj,callback) {
  
}

Gate.prototype.produceId=function(obj,callback) {
  
}

Gate.prototype.getId=function(obj) {
  
}

Gate.prototype.getIdByDescriptor=function(obj) {
  
}

Gate.prototype.hasId=function(obj) {
  
}

Gate.prototype.getDescriptorById=function(obj,callback) {
  
}

Gate.prototype.getDescriptorByObj=function(obj,callback) {
  
}

Gate.prototype.getDescriptorByDescrAttr=function(descriptor,name,callback) {
  
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

LocalGate.prototype.hasId=function(obj) {
  return (this.getId(obj)!=undefined);
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

LocalGate.prototype.getDescriptorByDescrAttr=function(descriptor,name,callback) {
  var attr=descriptor.obj[name];
  var to=typeof attr;
  if ((to=="object") && (attr!=null)) {
    var self=this;
    this.getDescriptorByObj(attr,function(desc) {
      if (desc==undefined) {
        self.produceId(attr,function(id,desc) {
          callback(desc,name,descriptor);
        },name);
      } else {
        callback(desc,name,descriptor);
      }
    });
  } else {
    throw new Error("attribute is no object");
  }
}


