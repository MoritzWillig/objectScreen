idf=new IdFactory("sc-object_id_");

var sObjects=[];
var descriptors=[];
var sObjectsById={};

function isDisplayed(desc) {
  return (descriptors.indexOf(desc)!=-1);
}

/**
 * displays and updates a descriptor
 * @param  {ObjectDescriptor}   desc     descriptor to be displayed or updated
 * @param  {array sObjects}   objs     already updated sObjects @private
 * @param  {Function} callback function to be called after the descriptor is updated
 */
function displayDescriptor(desc,objs,callback) { //console.log("insert",desc);
  if (!objs) { objs=[]; }

  if (!isDisplayed(desc)) {
    show(desc,objs,callback);
  } else {
    update(sObjects[idx],objs,callback);
  }
}

/**
 * creates and displays a new sObject from a descriptor
 * @param  {ObjectDescriptor}   desc     descriptor to be displayed
 * @param  {array sObjects}   objs     already updated sObjects @private
 * @param  {Function} callback function to be called when finished
 * @async
 * @private
 */
function show(desc,objs,callback) { //console.log("show",desc);
  var id=idf.newId();
  var box=screenBox.clone(true).appendTo(objscreen).css("left",100).css("top",100).attr("id",id);
  jsPlumb.draggable(box,{});

  var sObj={
    descriptor:desc,
    attr:{},
    gui:box,
    links:[],
    id:id
  };
  
  sObjectsById[id]=sObj;
  
  var selectables=objscreenBg.areaSelect("option","selectables");
  selectables.push(box);
  objscreenBg.areaSelect("option","selectables",selectables); 
  
  descriptors .push(desc );
  sObjects.push(sObj);
  update(sObj,objs,callback);
}

/**
 * updates a sObject with its descriptor data
 * @param  {sObject}   sObj     sObject to be updated
 * @param  {array sObject}   [objs]     already updated sObjects
 * @param  {Function} callback function to be called if sObject is updated
 * @async
 * @private
 */
function update(sObj,objs,callback) { //console.log("update",sObj);
  if (objs.indexOf(sObj)==-1) { objs.push(sObj); } else { callback(); return; }
  
  while (sObj.links.length>0) {
    var link=sObj.links[0];
    jsPlumb.detach(link.connection);
    
    sObj.links.shift();
  }
  
  sObj.descriptor.getAttrs(function(attrs) { //console.log("listing",attrs);
    if (attrs.length==0) {
      callback();
      return;
    }
    
    var count=attrs.length;
    for (var i in attrs) { //console.log("iterating val",name);
      sObj.links.push(null);
      sObj.descriptor.getAttr(attrs[i],(function(i) { return function(name,val) {
        var curr=sObj.attr[name];
        var isDesc=(val instanceof ObjectDescriptor);
        
        if (curr==undefined) { //attribute is not set
          var newEl=scObjectEntry.clone();
          sObj.attr[name]={
            gui:newEl,
            guiDesc:newEl.find('.sc-object-attr-desc').text(name),
            guiVal:newEl.find('.sc-object-attr-val'),
          };
          sObj.gui.find('.sc-object-content').append(newEl);
          curr=sObj.attr[name];
          
          if ((isDesc) && (!isDisplayed(val))) { //console.log(">>> inserting sub",name);
            displayDescriptor(val,objs,cb1);
            //console.log("<<< inserting sub",name);
          } else {
            cb1();
          }
        } else {
          cb1();
        }
        
        //update
        function cb1() {
          if (isDesc) {
            cb("object"); //descriptors which are referenced can only represent objects
          } else {
            cb(typeof val);
          }
        }
        
        function cb(type) {
          switch (type) {
          case "object": //make link
            if (val!=null) {
              var id=idf.newId();
              var source=div.clone().html("<i>object</i>");
              curr.guiVal.empty().append(source).attr("id",id);
              
              var idx=descriptors.indexOf(val);
              var connection=jsPlumb.connect({
                source:source,
                target:sObjects[idx].gui,
                deleteEndpointsOnDetach:true
              });
              
              var link={
                id:id,
                from:sObj, //object creating the connection
                source:source, //attribute gui linked
                dest:sObjects[idx], //target gui linked
                connection:connection
              }
              sObj.links[i]=link;
              
            } else {
              curr.guiVal.html("<i>null</i>");
            }
            break;
          default:
            curr.guiVal.text(val);
          }

          count--;
          if (count==0) { finish(); }
        }
      }})(i));
    }
    
    function finish() {
      //clean links
      sObj.links=sObj.links.filter(function(link) {
        return (link!=null);
      });
      
      callback();
    }
  });
}
