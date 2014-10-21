
focusedSObj=[];
activeOnFocus=[];

pressedKeys={};

function focusSObj(sObj,keepFocused) {
  if (keepFocused!=true) { clearFocus(); }
  if (sObj!=undefined) {
    if (sObj instanceof Array) {
      for (var i in sObj) {
        addFocus(sObj[i]);
      }
    } else {
      addFocus(sObj);
    }
  }
}

function removeFocus(sObj) {
  var idx;
  if (typeof sObj=="number") {
    var idx=sObj;
    sObj=focusedSObj[idx];
  } else {
    idx=focusedSObj.indexOf(sObj);
  }
  if ((sObj==undefined) || (idx==-1)) { return; }
  
  sObj.gui.removeClass("focus");
  focusedSObj.splice(idx,1);
  
  updateFocusFunctions();
}

function addFocus(sObj) {
  if (!isFocused(sObj)) {
    sObj.gui.addClass("focus");
    focusedSObj.push(sObj);
  }
  updateFocusFunctions();
}

function clearFocus() {
  while (focusedSObj.length!=0) { removeFocus(focusedSObj.length-1); }
  
  updateFocusFunctions();
}

function isFocused(sObj) {
  return (focusedSObj.indexOf(sObj)!=-1);
}

function updateFocusFunctions() {
  var disable=(focusedSObj.length==0);
  for (var idx in activeOnFocus) {
    var element=activeOnFocus[idx];
    element.button("option","disabled",disable);
  }
}


$(document).ready(function() {
  connectReciver();
  
  menu=$("#menu");
  objscreenBg=$("#screenBackground").mousedown(function(e) {
    if (!e.ctrlKey) { focusSObj(); }
  }).areaSelect({
    start:function(e,args) {
      if (pressedKeys[32]) { return false; }
    },
    select:function(e,args) {
      addFocus(sObjectsById[$(args.newSelection).attr("id")]);
    },
    deselect:function(e,args) {
      removeFocus(sObjectsById[$(args.remSelection).attr("id")]);
    },
    finish:function(e,args) {
      var selection=args.selected;
      //addFocus();
    }
  });
  objscreenBg.areaSelect("option","selectionClass",undefined);
  
  objscreen=$("#screen").draggable({
    //handle:"#screenBackground",
    start:function(e,ui) {
      if (!pressedKeys[32]) { return false; }
    }
  });
  footer=$("#footer");
  jsonfield=$("#data");
  
  span=$(document.createElement('span'));
  div=$(document.createElement('div'));
  input=$(document.createElement('input'));
  tr=$(document.createElement('tr'));
  td=$(document.createElement('td'));
  table=$(document.createElement('table'));
  
  //create menu
  div.clone().button({"label":"+"}).click(function() {
    var obj={
      time:(new Date()),
      someProperties:[1,2,3],
      nestedObj:{a:{},b:{c:"Test"}},
      null:null
    };
    //create some circular references
    obj.nestedObj.d=obj;
    obj.nestedObj.e=obj;
    
    provideObject(obj);
  }).appendTo(menu);
  span.clone().text(" | ").appendTo(menu);
  
  input.clone().attr("id","loadlGlobal_input").addClass("ui-widget").addClass("ui-input").appendTo(menu);
  div.clone().button({"label":"load from global"}).appendTo(menu).click(insertFromGlobal);
  
  span.clone().text(" | ").appendTo(menu);
  div.clone().button({"label":"load from json"}).appendTo(menu).click(insertFromJSON);
  
  span.clone().text(" | | | ").appendTo(menu);
  input.clone().val("ws:127.0.0.1:8080").attr("id","connectNetwork_input").addClass("ui-widget").addClass("ui-input").appendTo(menu);
  div.clone().button({"label":"connect to remote"}).appendTo(menu).click(connectToNetwork);
  
  span.clone().text(" | ").appendTo(menu);
  span.clone().text("no connection").appendTo(menu);
  
  
  
  screenBox=div.clone().addClass("sc-object").css("position","absolute").append(
    span.clone().addClass("sc-object-title").text("Title")
  ).append(
    span.clone().addClass("sc-object-class").text("<class>")
  ).append(
    div.clone().addClass("sc-object-controls").text("o")
  ).append(
    table.clone().addClass("sc-object-content")
  ).mousedown(function(e) {
    //console.log("focus");
    
    var sObj=sObjectsById[$(this).attr("id")];
    
    if ((e.ctrlKey) && (isFocused(sObj))) {
      removeFocus(sObj);
    } else {
      focusSObj(sObj,e.ctrlKey);
    }
    
    e.stopPropagation();
  });
  
  $(window).keydown(function(e) {
    pressedKeys[e.which]=true;
  }).keyup(function(e) {
    pressedKeys[e.which]=false;
  });
  
  //create footer
  activeOnFocus.push(div.clone().button({"label":"structure"}).click(function() {
    structTree(focusedSObj[0],undefined);
  }).appendTo(footer));
  
  
  scObjectEntry=tr.clone().append(td.clone().addClass('sc-object-attr-desc')).append(td.clone().addClass('sc-object-attr-val'));
  
  plumbContainer=$("#screen");
  jsPlumb.setContainer(plumbContainer);
  jsPlumb.importDefaults({
    RenderMode : "svg",
    ConnectionsDetachable:false,
    ReattachConnections:false,
    PaintStyle : {
      lineWidth:5,
      strokeStyle: '#555'
    },
    Anchors:["Right","Left"],
    Endpoints:[
      ["Dot",{radius:5}],
      ["Dot",{radius:5}]
    ],
    EndpointStyles : [
      {fillStyle:"#555"}, 
      {fillStyle:"#800"}
    ]
  });
  
  focusSObj();
});

function insertFromJSON() {
  var str=jsonfield.val();
  var obj;
  try {
    obj=JSON.parse(str);
  } catch(e) {
    console.log(e);
    alert("Error parsing json:",e.toString());
    return;
  }
  
  provideObject(obj);
}

function insertFromGlobal() {
  var name=$("#loadlGlobal_input").val();
  provideObject(window[name]);
}

function connectToNetwork() {
  var address=$("#connectNetwork_input").val();
  connectNetworkReciver(address);
}


function provideObject(obj) {
  //add object to provider
  provider.produceId(obj,function(id,desc) {
    provider.getDescriptorByObj(obj,function(prDescriptor) {
      //the provider can now deliver obj, get descriptor from reciver
      var id=provider.getId(obj);
      reciver.getDescriptorById(id,function(descriptor) {
        displayDescriptor(descriptor,undefined,function() {
          var idx=descriptors.indexOf(descriptor);
          structTree(sObjects[idx],-1);
        });
      });
    });
  });
}

function structTree(sObj,maxDepth,objs,cDepth) {
  var boxVSpacing=10;
  var boxHSpacing=150;
  
  if (cDepth==undefined) { cDepth=0; }
  if ((maxDepth!=undefined) && (cDepth==maxDepth)) { return 0; }
  if (!objs) { objs=[]; }
  if (objs.indexOf(sObj)!=-1) {
    return 0;
  } else {
    objs.push(sObj);
  }
  
  var height=0;
  var offset=sObj.gui.position();
  var size=[sObj.gui.find(".sc-object-content").width(),sObj.gui.height()+sObj.gui.find(".sc-object-content").height()];
  for (var sub in sObj.links) {
    var link=sObj.links[sub];
    
    if (objs.indexOf(link.dest)==-1) {
      link.dest.gui.css("left",offset.left+size[0]+boxHSpacing).css("top",offset.top+height);
      
      height+=structTree(link.dest,maxDepth,objs,cDepth+1)+boxVSpacing;
    }
  }
  
  if (cDepth==0) { //true if first external call (no recursion)
    //update jsPlumb nodes after moving elements
    jsPlumb.repaintEverything();
  }
  return (height<size[1])?size[1]+boxVSpacing:height;
}


