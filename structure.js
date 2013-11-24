
(function(){
	//"use strict";
	function cStructure(trs){
		trs.mouseDragContext = {startX:0,startY:0};
		trs.selectedNode = -1;
		trs.editTextNode = -1;
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
		// panel and buttons and textbox
			var pp = trs.showProxyPanel(25,60,128,212);
			//f25b waterdrop
			//f12e doc text
			//f120 - ok
			//f128 - cancel
			trs.loadFont("Ionicons", "fonts/ionicons.woff?v=1.3.5");
			pp.addButton(trs, "test", "\uf12e", null, "12px Ionicons", 12,
				{x:-14, y: 2, right: 0, bottom: 14, xrule: 'left', yrule: 'top', rrule: 'left', brule: 'abs'});
			pp.addButton(trs, "test2", "\uf25b", null, "12px Ionicons", 12,
				{x:-14, y: 2+14 +2, right: 0, bottom: 14, xrule: 'left', yrule: 'top', rrule: 'left', brule: 'abs'});
			pp.addTextBox(trs, "label", "text", false, null, 
				{x: 8, y: 22, right: -2, bottom: 14, xrule: 'left', yrule: 'top', rrule: 'right', brule: 'abs'});
			
			pp.addTextBox(trs, "label2", "text2", true, null, 
				{x: 8, y: 22+16+22, right: -2, bottom: 120, xrule: 'left', yrule: 'top', rrule: 'right', brule: 'abs'});
			
			var btnOk = pp.addButton(trs, "test", "\uf120", null, "18px Ionicons", 20,
				{x: 8, y: 22+16+22+120+4, right: 24, bottom: 24, xrule: 'left', yrule: 'top', rrule: 'abs', brule: 'abs'});
			var btnCancel = pp.addButton(trs, "test", "\uf128", null, "18px Ionicons", 20,
				{x: 8+24+4, y: 22+16+22+120+4, right: 24, bottom: 24, xrule: 'left', yrule: 'top', rrule: 'abs', brule: 'abs'});
			btnOk.proxy.hovercolor = "rgb(40, 255, 187)";
			btnCancel.proxy.hovercolor = "rgb(255, 40, 187)";
			trs.EditPanel = pp;
		//
		trs.DeltasMeasuring = [];

		trs.addEventListener("mousedown", mdown);
		trs.addEventListener("mouseup", mup);
		trs.addEventListener("mousemove", mmove);
		trs.addEventListener("dblclick", dblclick);
		trs.addEventListener("click", click);
		trs.addEventListener("keypress", dkeypress);
		trs.addEventListener("keydown", onKeyDown);

		trs.addEvent('MouseDragDelta');
		trs.addEvent('nodeSelected');
		trs.addEvent('nodeFocusLost');

		trs.addEventCallback("Render", Render);
		trs.addDeltaMeasuring = addDeltaMeasuring;

		trs.CreateTimer(30, checkDeltas);
		trs.canvas.oncontextmenu = function(e) {
			if(e.which === 3)
				return false;
			if(typeof trs.getActiveMenuName() === 'undefined')
			{
				if(trs.selectedNode>=0)
					trs.ShowMenu("node", trs.objects[trs.selectedNode].x, trs.objects[trs.selectedNode].y);
				else trs.ShowMenu("field", 0, 0);
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

	function click(e)
	{

	}
	function showTextBoxForSelectedNode(trs)
	{
		trs.editTextNode = trs.selectedNode;
		var txt = trs.objects[trs.editTextNode].label;
		txt = txt||"";
		trs.TextBoxShow("right", 250, "left Caption", txt, false, editAccepted);
		trs.PushEvent("nodeEditStart", trs.editTextNode);
	}
	function dkeypress(e)
	{
		if(this.editTextNode === -1
			&& e.keyCode === 13 && this.selectedNode >= 0)// enter pressed on selected node
		{
			showTextBoxForSelectedNode(this);
		}else{
			this.ProxyPanelInteractionEntry(e,null,null,null,null);
			//this.TextBoxInteractionInput(e,null,null,null,null);
		}
		e.preventDefault();
	}
	function onKeyDown(e){
		//console.log('pressed '+e.keyCode+', ['+String.fromCharCode(e.keyCode) +']');
		if(this.editTextNode === -1
			&& e.keyCode === 13 && this.selectedNode >= 0)// enter pressed on selected node
		{
			//showTextBoxForSelectedNode(this);
			e.preventDefault();
		}else
		if(e.keyCode === 13 || e.keyCode === 8
			|| e.keyCode === 37|| e.keyCode === 39
			|| e.keyCode === 40|| e.keyCode === 38
			|| e.keyCode === 46|| e.keyCode === 27)
		{
			//this.TextBoxInteractionInput(e,null,null,null,null);
			this.ProxyPanelInteractionEntry(e,null,null,null,null);
			e.preventDefault();
		}
	}
	function dblclick(e)
	{
		if(this.editTextNode>=0)
			return;
		this.updateBounds();

		var mx = e.pageX-this.bounds.left;
		var my = e.pageY-this.bounds.top;

		for (var i = 0; i < this.objects.length; i++) {
			if(hittest(this.objects[i].x + this.objs_translate.xoffset,this.objects[i].y + this.objs_translate.yoffset, this.options.view.node.radius, mx, my))
			{
				this.editTextNode = this.nodeSelected = i;
				break;
			}
		}
		if(this.editTextNode>=0)
			showTextBoxForSelectedNode(this)
	}
	function editAccepted(result)
	{
		if(result === "OK")
		{
			this.objects[this.editTextNode].label = this.TextBoxTextGet();
			this.PushEvent("nodeEditAccept", [this.editTextNode, this.objects[this.editTextNode].label]);
			this.TextBoxHide();
			this.editTextNode = -1;
		}else{
			this.PushEvent("nodeEditDecline", this.editTextNode);
			this.TextBoxHide();
			this.editTextNode = -1;
		}
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

			this.runtime.mx = mx;
			this.runtime.my = my;

			if(this.menu.displayMenu)
			{
				if(this.processInteractionMMdown(e.which, mx, my))
					return;
			}
			var sameSelected = false;
			if(this.editTextNode===-1)
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
			if(selectedN < 0 && !sameSelected && this.editTextNode===-1)
			{
				this.invokeEvent('nodeFocusLost', [this.selectedNode, -1, this.objects[this.selectedNode]]);
				this.selectedNode = -1
			}

			if(e.which == 1)
			{
				this.HideMenu();
				if(this.selectedNode >= 0 && this.editTextNode===-1)
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
			
				this.FieldDragging = (selectedN == -1) && this.editTextNode===-1;
				if(this.FieldDragging )
				{
					this.FieldDraggingPos.startX = mx;
					this.FieldDraggingPos.startY = my;
					this.FieldDraggingPos.prevX = this.objs_translate.xoffset;
					this.FieldDraggingPos.prevY = this.objs_translate.yoffset;
				}

			} else if(this.editTextNode===-1) {
				if(this.selectedNode >= 0)
				{
					this.ShowMenu("node", mx, my);
				}else{
					console.log("mdown", this.getActiveMenuName())
					if(this.getActiveMenuName() !== undefined)
						this.HideMenu();
					else this.ShowMenu("field", mx, my);
				}

			}
		}
		this.canvas.focus();
		e.preventDefault()
	}
	function mup(e)
	{
		var mx = e.pageX-this.bounds.left;
		var my = e.pageY-this.bounds.top;

		this.runtime.mx = mx;
		this.runtime.my = my;

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
		// this.TextBoxInteractionInput(null,null,
		// 	null,e,null);
		this.ProxyPanelInteractionEntry(null,null,null,e,null);
		e.preventDefault();
	}
	function mmove(e)
	{
		this.acceptSetCursor(true);// assume only mouse move event can change cursor style
		this.setCursor("default")
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
		// this.TextBoxInteractionInput(null,null,
		// 	null,null,e);
		this.ProxyPanelInteractionEntry(null,null, null,null,e);
		this.acceptSetCursor(false);// assume only mouse move event can change cursor style
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
	truss_o.extendModule(cStructure, "view.Structure", ["view.Input", "core.Events", "core.Animate", "objects.Tree", "view.Interface", "view.Menu", "view.ProxyPanel"]);
}());