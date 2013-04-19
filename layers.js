(function(){
	function cLayers(trs){
		trs.vLayers = [];
		trs.vCurrentLayer=undefined;
		trs.CommonContext=undefined;
		trs.CommonCanvas=undefined;

		trs.addLayer = addLayer;
		trs.setLayer = setLayer;
		trs.saveLayer = saveLayer;
		trs.drawLayer = drawLayer;
		trs.invalidateLayer = invalidateLayer;
		trs.hasLayerData = hasLayerData;
		trs.drawLayerPart = drawLayerPart;
	}
	function addLayer(name, show)
	{
		var lay = findLayer(this, name);
		if(lay<0)
		{
			var newCanvas = document.createElement('canvas');
			newCanvas.width = this.bounds.width;
			newCanvas.height = this.bounds.height;
			var newcont = newCanvas.getContext("2d");
			if(show)
				document.body.appendChild(newCanvas);
			this.vLayers.push({name:name, canvas:newCanvas, context: newcont, data:undefined});
		}else{
			throw 'the layer '+name+' already exists';
		}
	}
	function setLayer(name)
	{
		if(this.vCurrentLayer === name)
		{return false;}
		if(typeof name === "undefined")
		{
			this.saveLayer();
			this.context = this.CommonContext;
			this.canvas = this.CommonCanvas;
			this.vCurrentLayer = undefined;
			return;
		}
		var lay = findLayer(this, name);
		if(lay<0)
		{
			throw 'layer '+name+' not found';
		}else{
			this.saveLayer();
			this.vCurrentLayer = name;
			this.context = this.vLayers[lay].context;
			this.canvas = this.vLayers[lay].canvas;
			//this.Clear();
		}
	}
	function saveLayer()
	{
		if(typeof this.vCurrentLayer === "undefined")
		{	
			this.CommonContext = this.context;
			this.CommonCanvas = this.canvas;
			return;
		}
		var lay = findLayer(this, this.vCurrentLayer);
		this.vLayers[lay].data = this.GetCanvasData();
	}
	function drawLayer(name)
	{
		var lay = findLayer(this, name);
		if(lay<0)
		{
			throw 'layer '+name+' not found';
		}
		if(this.vLayers[lay].data != undefined)
		this.PutCanvasData(this.vLayers[lay].data);
	}
	function drawLayerPart(name,x,y,dx,dy,dw,dh)
	{
		var lay = findLayer(this, name);
		if(lay<0)
		{
			throw 'layer '+name+' not found';
		}
		this.PutCanvasDataPart(this.vLayers[lay].data,x,y,dx,dy,dw,dh);
	}
	function invalidateLayer(name)
	{
		var lay = findLayer(this, name);
		if(lay<0)
		{
			throw 'layer '+name+' not found';
		}
		this.vLayers[lay].data = undefined;
	}
	function hasLayerData(name)
	{
		var lay = findLayer(this, name);
		if(lay<0)
		{
			throw 'layer '+name+' not found';
		}
		return !(typeof this.vLayers[lay].data === "undefined");
	}
	function findLayer(trs, name)
	{
		for (var i = 0; i < trs.vLayers.length; i++) {
			if(trs.vLayers[i].name === name)
				return i;
		};
		return -1;
	}
	truss_o.extendModule(cLayers, "view.Layers", "view.Interface");
}());