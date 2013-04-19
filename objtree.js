// obj {name,offset}
(function(){
	//"use strict";
	function Tree(trs){
		trs.objects = [];
		trs.connections = [];
		trs.conIndexes = [];

		trs.AddObject = AddNode;
		trs.Connect = AddConnection;
		trs.ConnectIndexes = AddConnectionIndex;
		trs.NodeIndex = FindNode;
		trs.GetRelatedObjectsDeep = relationIndexesDeep;
		trs.separateTwo = separateTwo;
		trs.separateIfOneConnection = separateIfOneConnection;
		trs.RemoveObject = RemoveNode;
		trs.ConnectedTo = ConnectedTo;

		trs.runtime.temporaryConnection = false;
		trs.runtime.connectFrom = -1;
		trs.runtime.separateWith = -1;

		trs.addEvent('NodeAdded');
		trs.addEvent('NodeRemoved');
		trs.addEvent('NodePropsChanged');
		trs.addEvent('NodesSeparated');

		trs.option('view.node.radius', 10);

		trs.exportData = exportData;
		trs.importData = importData;

		//
		trs.aabb = {x:0, y:0, max_x:0, max_y:0, is_invalidate:false };
		trs.addEvent('NodeDisposition');
		trs.addEventCallback('NodeDisposition', NodeInvalidate);
		trs.NodeDisposition = NodeDisposition_;
		// objects xy translation
		trs.objs_translate = {xoffset:0,yoffset:0};
		trs.setProps = setProps;
		trs.setPropsI = setPropsI;

	}
	function NodeInvalidate(node)
	{
		this.aabb.x = this.aabb.y = 0xffffff;
		this.aabb.max_x = this.aabb.max_y = 0;
		this.aabb.is_invalidate = true;
	}
	function NodeDisposition_(node)
	{
		this.aabb.x = Math.min(node.x - this.options.view.node.radius + this.objs_translate.xoffset, this.aabb.x);
		this.aabb.y = Math.min(node.y - this.options.view.node.radius + this.objs_translate.yoffset, this.aabb.y);
		this.aabb.max_x = Math.max(node.x + this.options.view.node.radius + this.objs_translate.xoffset, this.aabb.max_x);
		this.aabb.max_y = Math.max(node.y + this.options.view.node.radius + this.objs_translate.yoffset, this.aabb.max_y);
	}
	function AddNode(name, x, y, basePrototype)
	{
		if(typeof basePrototype === "undefined")
			basePrototype = {};

		basePrototype.name = name;
		basePrototype.x = typeof x==="undefined"||(x===null?0:x);
		basePrototype.y = typeof y==="undefined"||(x===null?0:y);
		this.objects.push(basePrototype);

		this.invokeEvent('NodeAdded', [name, x, y, basePrototype]);

		return this.objects.length - 1;
	}
	function AddConnection(nodea,nodeb)
	{
		var a = this.NodeIndex(nodea);
		var b = this.NodeIndex(nodeb);
		if(a<0||b<0) {
			throw 'the nodes for connection not found';
		}
		if(a === b)
			return false;
		if(HasConnection(this, a, b))
		{
			return false;
		}
		this.connections.push([nodea, nodeb]);
		this.conIndexes.push([a, b]);
		return true;
	}
	function AddConnectionIndex(inodea,inodeb)
	{
		if(inodea < 0 ||this.objects.length<=inodea||
			inodeb < 0 ||this.objects.length<=inodeb)
			{throw 'the nodes indexes out of bounds';}
		if(inodea === inodeb || HasConnection(this, inodea, inodeb))
		{
			return false;
		}
		this.connections.push([this.objects[inodea].name, this.objects[inodeb].name]);
		this.conIndexes.push([inodea, inodeb]);
		return true;
	}
	function HasConnection(trus, inodea, inodeb)
	{
		for (var i = 0; i < trus.conIndexes.length; i++) {
			if((trus.conIndexes[i][0] === inodea || trus.conIndexes[i][0] === inodeb)
				&& (trus.conIndexes[i][1] === inodea || trus.conIndexes[i][1] === inodeb))
			{
				return true;
			}
		}
		return false;
	}
	function FindNode(name)
	{
		for (var i = 0; i < this.objects.length; i++) {
			if(this.objects[i].name === name)
				return i;
		};
		return -1;
	}
	function relationIndexesDeep(startNodeIndex) 
	{
		var nodes = [startNodeIndex];
		for (var j = 0; j < nodes.length; j++) {
			for (var i = 0; i < this.conIndexes.length; i++) {
				if(this.conIndexes[i][0] == nodes[j] && nodes.indexOf(this.conIndexes[i][1]) < 0)
					nodes.push(this.conIndexes[i][1]);
			};
		};
		return nodes;
	}
	function exportData()
	{
		var dexport = {version:this.version, clientDate:Date()};
		dexport.objects = [];
		for (var i = 0; i < this.objects.length; i++) {
			dexport.objects.push({name:this.objects[i].name,x:this.objects[i].x,y:this.objects[i].y, 
				label:this.objects[i].label,labelRight:this.objects[i].labelRight});
		};
		dexport.connections = this.conIndexes;
		return dexport;
	}
	function importData(data)
	{
		if(typeof data.objects === "object" && data.objects.length >= 0
			&& typeof data.connections === "object" && data.connections.length >= 0)
		{
				this.objects=data.objects;
				this.conIndexes=data.connections;
				this.update();
		}
	}
	function setProps(nodeName,lLeft,lRight)
	{
		//this.setPropsI(this.FindNode(nodeName), lLeft, lRight);
		this.PushEvent("NodeProps", [this.FindNode(nodeName), lLeft, lRight, undefined]);
	}
	function setPropsI(nodeIndex,lLeft,lRight,name)
	{
		this.objects[nodeIndex].label = lLeft;
		this.objects[nodeIndex].labelRight = lRight;
		if(typeof name !== 'undefined')
			this.objects[nodeIndex].name = name;

		this.invokeEvent('NodePropsChanged',[nodeIndex]);
	}
	function separateIfOneConnection(nodeIndex){
		var trus = this;
		var connectionCount = 0;
		var lastIndexConnection = -1;
		for (var i = 0; i < trus.conIndexes.length; i++) {
			if(trus.conIndexes[i][0] === nodeIndex || trus.conIndexes[i][1] === nodeIndex)
			{
				connectionCount ++;
				lastIndexConnection = i;
			}
		}
		if(connectionCount == 1)
		{
			var nodeIndexa=trus.conIndexes[lastIndexConnection][0];
			var nodeIndexb=trus.conIndexes[lastIndexConnection][1];

			this.conIndexes.splice(lastIndexConnection,1); 
			this.invokeEvent('NodesSeparated',[nodeIndexa, nodeIndexb]);
			return true;
		}
		return false;
	}
	function separateTwo(nodeIndexa, nodeIndexb){
		var trus = this;
		//var connectionCount = 0;
		var lastIndexConnection = -1;
		for (var i = 0; i < trus.conIndexes.length; i++) {
			if((trus.conIndexes[i][0] === nodeIndexa && trus.conIndexes[i][1] === nodeIndexb)
				|| (trus.conIndexes[i][1] === nodeIndexa && trus.conIndexes[i][0] === nodeIndexb))
			{
				//connectionCount ++;
				lastIndexConnection = i;
				break;
			}
		}
		if(lastIndexConnection >= 0)
		{
			this.conIndexes.splice(lastIndexConnection,1); 
			this.invokeEvent('NodesSeparated',[nodeIndexa, nodeIndexb]);
			return true;
		}
		return false;
	}
	function RemoveNode(index)
	{
		var obj = this.objects[index];
		this.objects.splice(index, 1);
		for (var i = 0; i < this.conIndexes.length; i++) {
			if(this.conIndexes[i][0] === index || this.conIndexes[i][1] === index)
			{
				this.conIndexes.splice(i, 1);
				this.connections.splice(i, 1);
				i--;
			}
		};
		for (var i = 0; i < this.conIndexes.length; i++) {
			if(this.conIndexes[i][0] > index)
			{
				this.conIndexes[i][0]--;
			}
			if(this.conIndexes[i][1] > index)
			{
				this.conIndexes[i][1]--;
			}
		}
		this.invokeEvent('NodeRemoved', [obj, index]);
	}
	function ConnectedTo(index)
	{
		var parents = [];
		for (var i = 0; i < this.conIndexes.length; i++) {
			if(this.conIndexes[i][1] === index)
			{
				parents.push(this.conIndexes[i][0]);
			}
		};
		return parents;	
	}
	truss_o.extendModule(Tree, "objects.Tree", ["core.Events", "core.runtime"]);
}());

