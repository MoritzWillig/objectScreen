
IdFactory=function(prefix,postfix,start) {
  if (prefix !=undefined) { this.prefix =prefix ; }
  if (postfix!=undefined) { this.postfix=postfix; }
  
  this._currentId=(start!=undefined)?start:0;
};

IdFactory.prototype.newId=function() {
  var id;
  if ((this.prefix==undefined) && (this.postfix==undefined)) {
    id=this._currentId;
  } else {
    id=this.prefix+""+this._currentId+""+this.postfix;
  }
  this._currentId++;
  return id;
}

IdFactory.prototype.postfix="";
IdFactory.prototype.prefix ="";

if ((typeof module!="undefined") && (module.exports)) {
  module.exports=IdFactory;
}
