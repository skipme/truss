(function(){
	function simpleDispatcher(trs){
		trs.DispatchEvents(mDispatch);
	}

	function mDispatch(scode, data)
	{
		console.log('dispatched: ' +scode, data);
		// 
		switch(scode)
		{
			case 'addNode':
				// selected node
				var name = this.uuid();
				var prot = {};//{label:name}
				var index = -1;
				if(typeof data !== 'undefined' && data>=0)
				{
					index = this.AddObject(name, this.objects[data].x+2, this.objects[data].y+45, prot);
					var gxy = guessNxy(this, data);
					if(typeof gxy !== 'undefined')
					{
						this.PushEvent("moved", [index, gxy.x, gxy.y]);
					}
					this.PushEvent("connectNode", [data, index]);
				} else {
					index = this.AddObject(name, this.objects.length*4, 200, prot);
				}
				this.PushEvent("NodeProps", [index, prot.label, prot.labelRight, name]);
				this.PushEvent("nodeSelected", index);
				this.update();
			break;
			case 'NodeProps':
				this.setPropsI(data[0],data[1],data[2],data[3]);
			break;
			case 'moved':
				this.objects[data[0]].x = data[1];
				this.objects[data[0]].y = data[2];
			break;
			case 'iseparateNode':
				// separate node
				if(typeof data !== 'undefined' && data>=0)
				{
				 	if (this.separateIfOneConnection(data)) {
		            } else {
		                this.runtime.separateWith = data;
		            }
		        }
			break;

			case 'separateNode':
				this.separateTwo(data[0], data[1]);
			break;

			case 'removeNode':
				// selected node
				if(typeof data !== 'undefined' && data>=0)
				{
					this.RemoveObject(data);
				}
			break;

			case 'iconnectNode':
				// selected node
				if(typeof data !== 'undefined' && data>=0)
				{
					this.runtime.temporaryConnection = true;
					this.runtime.connectFrom = data;
				}
				this.update();
			break;
			case 'nodeSelected':

				// selected node
				if(typeof data !== 'undefined' && data>=0)
				{
					if(this.objects.length <= data)
					{
						console.log("wrong new index selected");
						return;
					}
					this.invokeEvent('nodeFocusLost', [this.selectedNode, data, this.selectedNode>=0?this.objects[this.selectedNode]:null]);
					this.invokeEvent('nodeSelected', [data, this.objects[data]]);
					this.selectedNode = data;
					if(this.runtime.temporaryConnection)
					{
						this.PushEvent("connectNode", [this.runtime.connectFrom, data]);
						this.runtime.temporaryConnection = false;
					}
					if(this.runtime.separateWith>=0)
					{
						this.PushEvent("separateNode", [this.runtime.separateWith, data]);
						this.runtime.separateWith = -1;
					}
				}
				this.update();
			break;
			case 'connectNode':
				this.ConnectIndexes(data[0], data[1]);
			break;
		}
	}
	function guessNxy(trs, parentIndex)
	{
		var obj = trs.objects[parentIndex];
		var parents = trs.ConnectedTo(parentIndex);
		
		if(parents.length === 1)
		{
			var parentOfParent = trs.objects[parents[0]];
			dx = obj.x-parentOfParent.x;
			dy = obj.y-parentOfParent.y;
			return {x:dx+obj.x, y:dy+obj.y};
		}
		// return undefined;
	}
	truss_o.extendModule(simpleDispatcher, "simpleDispatcher", ["view.Input", "core.runtime"]);
}());