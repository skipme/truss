(function(){
	//"use strict";
	// var menulayer ='dmeta.menu';
	var radius = 128;
	var metalayer = 'metalay';

	function dmetaSpheres(trs)
	{
		var iface = {
			Render: Render,
			update: update
		};
		trs.addViewEngine("DemoMetaspheres", iface);

		var r = trs.runtime;
		trs.addLayer(metalayer, true);
		trs.CreateTimer(1000/40, updateMetaLayer);

		r.dmeta = { ovals: [], ovalRadius: radius, gradient: null, dragging: {index: -1, sx: 0, sy: 0, cx: 0, cy: 0} };
		createMetas(trs, r.dmeta);

		r.dmeta.gradient = trs.MetaPrepareGradient(radius);

		trs.addEventListener("mousedown", mdown);
		trs.addEventListener("mouseup", mup);
		trs.addEventListener("mousemove", mmove);
	}
	function updateMetaLayer()
	{
		this.setLayer(metalayer);
		this.Clear();
		//
		 
		drawMetas(this, this.runtime.dmeta);
		this.postEffectA();
		//this.postEffectA_();

		this.MetaPostProcess();
		//

		

	}
	function mdown(e)
	{
		var mx = e.pageX-this.bounds.left;
		var my = e.pageY-this.bounds.top;
		var dmeta = this.runtime.dmeta;

		dmeta.dragging.index = -1;

		for (var i = 0; i < dmeta.ovals.length; i++) {
			var centerx = dmeta.ovals[i].x;//+radius;
			var centery = dmeta.ovals[i].y;//+radius;
			if(hittest(centerx, centery, 32, mx, my))
			{
				dmeta.dragging.index = i;
				dmeta.dragging.sx = mx;
				dmeta.dragging.sy = my;
				dmeta.dragging.cx = mx - dmeta.ovals[i].x;
				dmeta.dragging.cy = my - dmeta.ovals[i].y;

				this.update();
				break;
			}
		}
	}
	function mup(e)
	{
		var dmeta = this.runtime.dmeta;
		dmeta.dragging.index = -1;
	}
	function mmove(e)
	{
		var mx = e.pageX-this.bounds.left;
		var my = e.pageY-this.bounds.top;
		var dmeta = this.runtime.dmeta;
		if(dmeta.dragging.index >= 0)
		{
			var dov = dmeta.ovals[dmeta.dragging.index];
			dov.x = mx -  dmeta.dragging.cx;
			dov.y = my -  dmeta.dragging.cy;
		}
	}
	function createMetas(trs, dmeta)
	{
		for (var i = 0; i < 10; i++) {
			dmeta.ovals.push(createMSphere(trs, dmeta));
		};
	}
	function createMSphere(trs, dmeta)
	{
		var ms = { x: trs.rndm(12, trs.bounds.width), y: trs.rndm(12, trs.bounds.height)};
		return ms;
	}
	function drawMetas(trs, dmeta)
	{
		var d = dmeta.ovalRadius * 2;
		for (var i = 0; i < dmeta.ovals.length; i++) {
			trs.MetaDrawGradient(dmeta.gradient, dmeta.ovals[i].x, dmeta.ovals[i].y, d, d);
		};
	}
	function update()
	{
		// this.invalidateLayer(textlayer);
		// this.invalidateLayer(menulayer);
	}
	function Render()
	{
		// this.setLayer();

		//
		this.setLayer();
		//this.Clear();
		
		//this.drawLayer(metalayer);
		this.context.globalCompositeOperation ="copy";
		this.drawLayer(metalayer);
		this.context.globalCompositeOperation = "source-over";
		//
		this.context.fillStyle = "#ffffff";
		this.SetShadow(0,0,6,"#000000");
		this.context.fillText(' |||  ' +this.fps.rate.toFixed(2)+' fps', 14,14);
		//this.context.fillText('', 14, this.bounds.height - 96);
		this.SetShadow();

		// if(!this.hasLayerData(menulayer))
		// {
		// 	this.setLayer(menulayer);
		// 	this.Clear();
		// 	this.RenderDisplayMenuText(menulayer, true);
		// 	this.RenderDisplayMenuBackground(menulayer);
		// 	this.RenderDisplayMenuText(menulayer);
		// 	this.saveLayer();
		// }

		// this.setLayer();
		// this.drawLayer(menulayer);
	}
	function hittest(x,y,radius,hitX,hitY) {
		var dx = x - hitX;
		var dy = y - hitY;
		
		return(dx*dx + dy*dy < radius*radius*4);
	}
	truss_o.extendModule(dmetaSpheres, "view.DMetaspheres", ["view.Interface", "view.Layers", "objects.Tree", "view.Structure", "core.runtime", "view.Menu", "extBlur", "view.Metaspheres"]);
}());