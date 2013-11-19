
(function(){
	//"use strict";
	function cStructure(trs){
		trs.mouseDragContext = {startX:0,startY:0};
		trs.selectedNode = -1;
		trs.Dragging = false;
		trs.FieldDragging = false;
		trs.FieldDraggingPos = {startX:0, startY:0, prevX:0, prevY:0};
		trs.moveNodeTo = moveNodeTo;
		trs.DragList = [];
		//
		trs.AddDisplayMenu("node", {items:[
			{text:'Add + connect', callback:MTN_addnode}, 
			{text:'---------------'},
			{text:'Separate', callback:MTN_sepnode},
			{text:'Connect with...', callback:MTN_connode},
			{text:'Remove', callback:MTN_removenode},
			]});
		trs.AddDisplayMenu("field", {items:[
			{text:'Find node', callback:undefined}, 
			{text:'---------------'},
			{text:'Locate to map center', callback:undefined},
			{text:'play intro video', callback:undefined},
			{text:'play all history', callback:undefined},
			]});
		//
		trs.DeltasMeasuring = [];

		//trs.addEventListener("click", clicked);
		trs.addEventListener("mousedown", mdown);
		trs.addEventListener("mouseup", mup);
		trs.addEventListener("mousemove", mmove);

		trs.addEvent('MouseDragDelta');
		trs.addEvent('nodeSelected');
		trs.addEvent('nodeFocusLost');

		trs.addEventCallback("Render", Render);
		trs.addDeltaMeasuring = addDeltaMeasuring;

		trs.CreateTimer(30, checkDeltas);
		trs.canvas.oncontextmenu = function() {
			if(typeof trs.menu.displayMenu === 'undefined' && trs.selectedNode>=0)
			{
				trs.ShowMenu("test", trs.objects[trs.selectedNode].x, trs.objects[trs.selectedNode].y);
     		}
     		return false;  
		} 
		//
	}
	function MTN_sepnode(){
		this.PushEvent("iseparateNode", this.selectedNode);
	}
	function MTN_addnode(){
		this.PushEvent("addNode", this.selectedNode);
	}
	function MTN_removenode(){
		this.PushEvent("removeNode", this.selectedNode);
	}
	function MTN_connode(){
		this.PushEvent("iconnectNode", this.selectedNode);
	}
	function checkDeltas()
	{
		for (var i = 0; i < this.DeltasMeasuring.length; i++) {
			var dm = this.DeltasMeasuring[i];
			if(dm[0]>=dm[1])
			{
				dm[2].call(this);
				dm[0] = 0;
			}
		}
	}
	function addDeltaMeasuring(interval,callback)
	{
		this.DeltasMeasuring.push([0,interval,callback]);
		return this.DeltasMeasuring.length-1;
	}
	function buildVisibleNodesList()
	{

	}

	function clicked(e)
	{
	}
	function mdown(e)
	{
		//console.log("mdown");
		//return;
		if(this.Dragging)
		{
			//e.preventDefault();
			return;
		}

		if(e.which == 1 || e.which == 3)
		{
			this.updateBounds();

			var selectedN=-1;
			var mx = e.pageX-this.bounds.left;
			var my = e.pageY-this.bounds.top;
			if(this.menu.displayMenu)
			{
				if(this.processInteractionMMdown(e.which, mx, my))
					return;
			}
			var sameSelected = false;

			for (var i = 0; i < this.objects.length; i++) {
				if(hittest(this.objects[i].x + this.objs_translate.xoffset,this.objects[i].y + this.objs_translate.yoffset, this.options.view.node.radius, mx, my))
				{
					if(this.selectedNode === i)
					{
						sameSelected = true;
						continue;
					}
					sameSelected = false;
					
					this.PushEvent("nodeSelected", i);
					selectedN = i;
					break;
				}
			}
			if(selectedN < 0 && !sameSelected)
			{
				this.invokeEvent('nodeFocusLost', [this.selectedNode, -1, this.objects[this.selectedNode]]);
				this.selectedNode = -1
			}

			if(e.which == 1)
			{
				this.HideMenu();
				if(this.selectedNode >= 0)
				{
					this.Dragging = true;
					//console.log("dragging on");
					this.DragList = this.GetRelatedObjectsDeep(this.selectedNode);
					for (var i = 0; i < this.DragList.length; i++) {
						var o = this.objects[this.DragList[i]];
						o.targetX = 0;
						o.targetY = 0; 
						o.dragOn = false;
					};
					this.mouseDragContext.startX = mx - this.objects[this.selectedNode].x - this.objs_translate.xoffset;
					this.mouseDragContext.startY = my - this.objects[this.selectedNode].y - this.objs_translate.yoffset;
					this.objects[this.selectedNode].dragOn = false;
					this.objects[this.selectedNode].targetX = 0;
					this.objects[this.selectedNode].targetY = 0;
					this.objects[this.selectedNode].prevx = this.objects[this.selectedNode].x;
					this.objects[this.selectedNode].prevy = this.objects[this.selectedNode].y;
				}
			
				this.FieldDragging = selectedN == -1;
				if(this.FieldDragging)
				{
					this.FieldDraggingPos.startX = mx;
					this.FieldDraggingPos.startY = my;
					this.FieldDraggingPos.prevX = this.objs_translate.xoffset;
					this.FieldDraggingPos.prevY = this.objs_translate.yoffset;
				}
				this.update();
			} else {
				if(this.selectedNode >= 0)
				{
					this.ShowMenu("node", mx, my);
				}else{
					if(this.getActiveMenuName() !== undefined)
						this.HideMenu();
					else this.ShowMenu("field", mx, my);
				}
				this.update();
			}
		}
		this.canvas.focus();
		e.preventDefault()
	}
	function mup(e)
	{
		//console.log("mup");
		if(e.which == 1)
		{
			if(this.FieldDragging)
				this.FieldDragging = false;

			if(this.Dragging)
			{
				this.Dragging = false;
				if(this.selectedNode>=0 && (this.objects[this.selectedNode].x != this.objects[this.selectedNode].prevx || this.objects[this.selectedNode].y != this.objects[this.selectedNode].prevy))
					this.PushEvent("moved", [this.selectedNode, this.objects[this.selectedNode].x, this.objects[this.selectedNode].y]);
				//console.log("dragging off", e);
			}
		}
		e.preventDefault();
	}
	function mmove(e)
	{
		var mx = e.pageX-this.bounds.left;
		var my = e.pageY-this.bounds.top;
		
		this.runtime.mx = mx;
		this.runtime.my = my;
		
		if(this.Dragging)
		{
			this.moveNodeTo(this.selectedNode,
				mx-this.objs_translate.xoffset - this.mouseDragContext.startX,
				my-this.objs_translate.yoffset - this.mouseDragContext.startY);
			this.update();
		}
		else if (this.FieldDragging)
		{
			var dx = mx - this.FieldDraggingPos.startX;
			var dy = my - this.FieldDraggingPos.startY;
			this.objs_translate.xoffset = dx + this.FieldDraggingPos.prevX;
			this.objs_translate.yoffset = dy + this.FieldDraggingPos.prevY;

			var Dt = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
			for (var i = 0; i < this.DeltasMeasuring.length; i++) {
				this.DeltasMeasuring[i][0]+=Dt;
			}

			this.update();
		}else{
			if(this.runtime.temporaryConnection)
				this.update();
		}
		this.processInteractionMMove(mx, my);
		e.preventDefault()
	}

	function hittest(x,y,radius,hitX,hitY) {
		var dx = x - hitX;
		var dy = y - hitY;
		
		return(dx*dx + dy*dy < radius*radius*4);
	}
	function moveNodeTo(nodeIndex,targetX,targetY) {
		this.objects[nodeIndex].targetX = targetX;
		this.objects[nodeIndex].targetY = targetY;
		//this.objects[nodeIndex].needDrag = true;
		this.objects[nodeIndex].dragOn = true;
	}
	function Render() {

		var maxDx = 0;
		var maxDy = 0;
		
		if(this.selectedNode>=0) {
			this.objects[this.selectedNode].needDrag = (Math.abs(this.objects[this.selectedNode].x - this.objects[this.selectedNode].targetX) > 0.1) || (Math.abs(this.objects[this.selectedNode].y - this.objects[this.selectedNode].targetY) > 0.1);

			if(this.objects[this.selectedNode].needDrag && this.objects[this.selectedNode].dragOn/*&& this.objects[this.selectedNode].targetX >= 0*/) {

				var dx = .4*(this.objects[this.selectedNode].targetX - this.objects[this.selectedNode].x);
				var dy = .4*(this.objects[this.selectedNode].targetY - this.objects[this.selectedNode].y);
				
				this.objects[this.selectedNode].x = this.objects[this.selectedNode].x + dx;
				this.objects[this.selectedNode].y = this.objects[this.selectedNode].y + dy;
				//this.invokeEvent('NodeDisposition', [this.objects[this.selectedNode]]);

				for (var i = 1; i < this.DragList.length; i++) {
					var index = this.DragList[i];
					this.objects[index].x += dx;
					this.objects[index].y += dy;
					//this.invokeEvent('NodeDisposition', [this.objects[index]]);
				};
				maxDx = Math.max(maxDx, Math.abs(dx));
				maxDy = Math.max(maxDy, Math.abs(dy));
			}
		}
		if(maxDx>0 || maxDy>0)
		{
			var Dt = Math.sqrt(Math.pow(maxDx,2)+Math.pow(maxDy,2))
			for (var i = 0; i < this.DeltasMeasuring.length; i++) {
				this.DeltasMeasuring[i][0]+=Dt;
			}
		}
	}
	truss_o.extendModule(cStructure, "view.Structure", ["view.Input", "core.Events", "core.Animate", "objects.Tree", "view.Interface", "view.Menu"]);
}());