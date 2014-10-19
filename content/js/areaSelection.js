
(function ($) {
  $.widget("ui.areaSelect",{
    options:{
      borderColor:"rgb(0,200,255)",
      backgroundColor:"rgba(0,200,255,0.2)",
      zIndex:100,
      selectables:[],
      selectionClass:"ui-areaSelection-selected"
    },
    _create: function() {
      var self=this;
      var o=self.options;
      
      return $(this).each(function() {
        var selectionUi=$(document.createElement('div')).addClass("ui-areaSelection-selectionArea")
          .css("position","absolute")
          .css("background-color",o.backgroundColor)
          .css("border","1px solid #fff")
          .css("border-color",o.borderColor)
          .css("z-index",o.zIndex);
        
        var t=$(this.element);
        
        var area={position:{top:0,left:0},size:{width:0,height:0}};
        var triggered;
        var selected=[];
        var start;
        var offset;
        
        var selectablesAreaCache=[];
        
        
        function isActive(e) { return ((e.which==1) || (e.button==1)); }
        
        t.mousedown(function(e) {
          triggered=((isActive(e)) && (self._trigger("start", e, {selectionUi:selectionUi, area:area})!==false));
          
          if (triggered) {
            t.append(selectionUi);
            
            offset=t.offset();
            start={left:e.clientX-offset.left,top:e.clientY-offset.top};
            area.position={left:start.left,top:start.top};
            area.size={width:0,height:0};
            selectionUi.css("left"  ,area.position.left);
            selectionUi.css("top"   ,area.position.top );
            selectionUi.css("width" ,area.size.width );
            selectionUi.css("height",area.size.height);
            
            e.stopPropagation();
            
            //cache selection areas
            selectablesAreaCache=[];
            $(o.selectables).each(function() {
              var t=$(this);
              var lt=t.offset();
              var rb={left:lt.left+t.width(),top:lt.top+t.height()};
              
              selectablesAreaCache.push({element:t,lt:lt,rb:rb});
            });
          }
        });
        $(window).mousemove(function(e) {
          if ((triggered) && (isActive(e))) {
            var current={left:e.pageX-offset.left,top:e.pageY-offset.top};
            if (current.left<start.left) {
              area.position.left=current.left;
              area.size.width=start.left-current.left;
            } else {
              area.position.left=start.left;
              area.size.width=current.left-start.left;
            }
            
            if (current.top<start.top) {
              area.position.top=current.top;
              area.size.height=start.top-current.top;
            } else {
              area.position.top=start.top;
              area.size.height=current.top-start.top;
            }
            
            selectionUi.css("left"  ,area.position.left);
            selectionUi.css("top"   ,area.position.top );
            selectionUi.css("width" ,area.size.width );
            selectionUi.css("height",area.size.height);
            
            for (var i in selectablesAreaCache) {
              var el=selectablesAreaCache[i];
              
              var xInter=!((area.position.left+area.size.width <=el.lt.left-offset.left) || (area.position.left>=el.rb.left-offset.left)); //x-axis intersection
              var yInter=!((area.position.top +area.size.height<=el.lt.top -offset.top ) || (area.position.top >=el.rb.top -offset.top )); //y-axis intersection
              
              var intersect=(xInter && yInter);
              var idx=selected.indexOf(el.element);
              if (intersect) {
                if ((idx==-1) && (self._trigger("select", e, {selected:selected, newSelection:el.element ,selectionUi:selectionUi, area:area})!==false)) {
                  el.element.addClass(o.selectionClass);
                  selected.push(el.element);
                }
              } else {
                if ((idx!=-1) && (self._trigger("deselect", e, {selected:selected, remSelection:el.element ,selectionUi:selectionUi, area:area},true)!==false)) {
                  el.element.removeClass(o.selectionClass);
                  selected.splice(idx,1);
                }
              }
            }
            self._trigger("move", e, {selected:selected, selectionUi:selectionUi, area:area});
          }
        });
        $([t,window]).mouseup(function(e) {
          if ((isActive(e)) && (triggered)) {
            self._trigger("finish", e, {selected:selected, selectionUi:selectionUi, area:area});
            
            selectionUi.detach();
            area={position:{top:0,left:0},size:{width:0,height:0}};
            
            e.stopPropagation();
            
            selected=[];
            for (var i in selectablesAreaCache) {
              var el=selectablesAreaCache[i];
              el.element.removeClass(o.selectionClass);
            }
          }
          triggered=false;
        });
      });
      
      self._trigger("create", null, undefined);
    },
    destroy: function() {
      self._trigger("destroy", null, undefined);
    },
    _setOption: function(option, value) {
      $.Widget.prototype._setOption.apply(this,arguments);
      
      switch (option) {
        case "selectables":
          
      }
    }
  });
}(jQuery));