
(function(){
	//"use strict";
	var backgroundlayer = 'dbg.background';
	var nodelayer ='dbg.nodes';
	var textlayer ='dbg.text';
	var menulayer ='dbg.menu';
	var atlasIds = [];

	function cViewDebug(trs){
		var iface = {
			Render:Render,
			update:update
		};

		trs.option('view.dbg.backgroundColor1', "rgba(60, 78, 98, 1)");
		trs.option('view.dbg.backgroundColor2', "rgba(35, 47, 59, 1)");

		trs.addViewEngine("Debug", iface);
		trs.setViewEngine("Debug");

		trs.addLayer(backgroundlayer);
		trs.addLayer(nodelayer);
		trs.addLayer(textlayer/*, true*/);
		trs.addLayer(menulayer);

		trs.addEventCallback("MouseDragDelta", MouseDelta);
		trs.addEventCallback("NodePropsChanged", redrawText);

		trs.addDeltaMeasuring(2, updateLayers);
		trs.runtime.InvalidateTextlayer = false;

		trs.aabb = {x:23,y:44,max_x:66,max_y:88 };

		trs.setBackground = setBackground;
		//trs.ShowMenu("test", 112, 120);
	}
	
	function rnd(min,max){
		return min + Math.floor((Math.random()*(max-min)+1));
	}

	function update()
	{
		this.invalidateLayer(textlayer);
		this.invalidateLayer(menulayer);
	}
	function redrawText()
	{
		this.update();
	}
	function setBackground(color_a,color_b)
	{
		if(typeof color_a != 'undefined'){this.options.view.dbg.backgroundColor1 = color_a;}
		if(typeof color_b != 'undefined'){this.options.view.dbg.backgroundColor2 = color_b;}
		this.invalidateLayer(backgroundlayer);
		this.update();
	}
	function drawAABB(trs)
	{
		trs.SetShadow();
		trs.context.lineWidth = 1;
		trs.context.strokeStyle = "#aaFaFa";
		trs.context.strokeRect(trs.aabb.x+.5,trs.aabb.y+.5,trs.aabb.max_x-trs.aabb.x,trs.aabb.max_y-trs.aabb.y);
	}
	function updateLayers()
	{
		this.runtime.InvalidateTextlayer = true;
	}
	function Render()
	{
		// this is the raw part of manipulation view
		//
		if(this.hasLayerData(backgroundlayer))
		{
			this.setLayer();
			this.Clear();
			this.SetShadow();
			//this.drawLayer(backgroundlayer);
		}else{
			//this.log(backgroundlayer);
			this.setLayer(backgroundlayer);

			this.dbgview = {};
			this.dbgview.gradientBackground = this.context.createRadialGradient(280, 320, 0, 300, 300, 500);
		    // this.dbgview.gradientBackground.addColorStop(0, "rgba(60, 78, 98, 1)");
		    // this.dbgview.gradientBackground.addColorStop(1, "rgba(35, 47, 59, 1)");
		    this.dbgview.gradientBackground.addColorStop(0, this.options.view.dbg.backgroundColor1);
		    this.dbgview.gradientBackground.addColorStop(1, this.options.view.dbg.backgroundColor2);
			this.context.fillStyle = this.dbgview.gradientBackground;
			this.context.fillRect(0,0,this.bounds.width,this.bounds.height);
			this.saveLayer();
			this.setLayer();
			this.drawLayer(backgroundlayer);
		}
	    this.context.font = "8pt Verdana";
		
		this.setLayer();

		// drawAllFlexes(this);
		
		this.SetShadow();
		this.context.fillStyle = "rgb(255, 255, 255)";
		// node layer
	    //if(this.hasLayerData(nodelayer))
		//{
		//		this.Clear();
		//		this.setLayer();
		//		this.drawLayer(nodelayer);
		//}else{
			var separateMode = false;
			if(this.runtime.separateWith >=0 )
				separateMode = true;

			this.aabb = {x:0xffffff,y:0xffffff,max_x:-0xffffff,max_y:-0xffffff };
			this.context.fillText(this.fps.rate.toFixed(2)+' fps', 14,14);
			this.setLayer(nodelayer);
			this.Clear();
			this.context.translate(this.objs_translate.xoffset,this.objs_translate.yoffset);
			this.SetShadow();
			this.context.fillStyle = "rgb(255, 255, 255)";
			for (var i = 0; i < this.conIndexes.length; i++) {
				var cx1 = 0; var cy1 = 0; var cx2 = 0; var cy2 = 0;

				cx1 = this.objects[this.conIndexes[i][0]].x;
				cy1 = this.objects[this.conIndexes[i][0]].y;
				cx2 = this.objects[this.conIndexes[i][1]].x;
				cy2 = this.objects[this.conIndexes[i][1]].y;

				var radius = 4.0;
				var ml = this.options.view.node.radius;
                var mx = cx2 - cx1; var my = cy2 - cy1;

                var md = Math.sqrt(Math.pow(mx, 2) + Math.pow(my, 2));
                var mk = ml / md;

                var x = cx2 - (mk * mx); var y = cy2 - (mk * my);

                var cx1 = cx1 + (mk * mx); var cy1 = cy1 + (mk * my);

                if(separateMode)
                {
                	if(this.runtime.separateWith == this.conIndexes[i][0] ||this.runtime.separateWith == this.conIndexes[i][1])
                	{
                		this.context.fillStyle = this.context.strokeStyle = "#FFFFFF";
                	}else{
                		this.context.fillStyle = this.context.strokeStyle = "#aaaaaa";
                	}
                }else {
                	this.context.strokeStyle = "#FFFFFF";
                }
                
				this.drawArrow(cx1,cy1,x,y,3,1,Math.PI/4,radius);
			};
  			//this.SetShadow(2,2,6,"rgba(0, 0, 0, 0.8)");

  			this.context.lineWidth = 1;
  			this.context.strokeStyle = "#FFFFFF";
			for (var i = 0; i < this.objects.length; i++) {
				
	    		if(this.selectedNode == i)
	    		{
	    			this.context.fillStyle = "rgba(68, 110, 150, 0.6)";
	    		}else{
	    			this.context.fillStyle = "rgba(0, 0, 0, 0.2)";
	    		}
	    		
				this.context.beginPath();
		    	this.context.arc(this.objects[i].x, this.objects[i].y, this.options.view.node.radius, 0, 2 * Math.PI, false);
		    	this.context.closePath();
		    	this.context.fill();
		    	this.context.stroke();

		    	this.NodeDisposition(this.objects[i]);
			}
			if(this.aabb.is_invalidate)
				this.aabb.is_invalidate = false;
			this.context.translate(-this.objs_translate.xoffset,-this.objs_translate.yoffset);
			// aa bb box
			drawAABB(this);

			this.saveLayer();

			this.setLayer();
			this.SetShadow();
			this.drawLayer(nodelayer);
		//}
		// text layer
			if(!this.runtime.InvalidateTextlayer && this.hasLayerData(textlayer))
			{
				//this.SetShadow();
				//this.drawLayer(textlayer);
			} else {
				this.runtime.InvalidateTextlayer = false;
				this.setLayer(textlayer);
				this.Clear();
				this.context.font = "9pt Verdana";
				this.SetShadow();
				this.context.translate(this.objs_translate.xoffset,this.objs_translate.yoffset);

				this.context.fillStyle = "rgb(255, 255, 255)";
				for (var i = 0; i < this.objects.length; i++) {
					if(this.objects[i].label !== undefined){
						
		  				var dim = this.context.measureText(this.objects[i].label);
		  				var tx = this.objects[i].x-this.options.view.node.radius - dim.width - 4;
		  				var ty = this.objects[i].y+this.options.view.node.radius*.5;

		  				this.context.fillStyle = "rgba(255, 255, 255, 0.1)";
		  				this.context.fillRect(tx,ty-10,dim.width, 12)

		  				this.context.fillStyle = "rgb(255, 255, 255)";
		  				this.context.fillText(this.objects[i].label, tx, ty);
		  			}
		  			if(this.objects[i].labelRight !== undefined){
		  				var dim = this.context.measureText(this.objects[i].labelRight);
		  				var tx = this.objects[i].x+this.options.view.node.radius+ 4;
		  				var ty = this.objects[i].y+this.options.view.node.radius*.5;

		  				this.context.fillStyle = "rgba(255, 255, 255, 0.1)";
		  				this.context.fillRect(tx,ty-10,dim.width, 12)

						this.context.fillStyle = "rgb(255, 255, 255)";
		  				this.context.fillText(this.objects[i].labelRight, this.objects[i].x+this.options.view.node.radius + 4,
		  				 	this.objects[i].y+this.options.view.node.radius*.5);
		  			}
				}
				this.context.translate(-this.objs_translate.xoffset,-this.objs_translate.yoffset);
				this.saveLayer();
			}
		// 
		if(this.runtime.temporaryConnection)
		{
			index = this.runtime.connectFrom;
			cx1 = this.objects[index].x;
			cy1 = this.objects[index].y;
			cx2 = this.runtime.mx-this.objs_translate.xoffset;
			cy2 = this.runtime.my-this.objs_translate.yoffset;

			var radius = 4.0;
			var ml = this.options.view.node.radius;
            var mx = cx2 - cx1; var my = cy2 - cy1;

            var md = Math.sqrt(Math.pow(mx, 2) + Math.pow(my, 2));
            var mk = ml / md;

            var x = cx2 - (mk * mx); var y = cy2 - (mk * my);

            var cx1 = cx1 + (mk * mx); var cy1 = cy1 + (mk * my);
            this.setLayer();
			this.SetShadow();
            this.context.translate(this.objs_translate.xoffset,this.objs_translate.yoffset);
			this.context.fillStyle = "#aaaaaa";
			this.context.strokeStyle = "#aaaaaa";
			this.drawArrow(cx1,cy1,x,y,3,1,Math.PI/4,radius);	
			this.context.translate(-this.objs_translate.xoffset,-this.objs_translate.yoffset);
		}
		// Menu
		if(!this.hasLayerData(menulayer))
		{
			this.setLayer(menulayer);
			this.Clear();
			this.RenderDisplayMenuText(menulayer, true);
			this.RenderDisplayMenuBackground(menulayer);
			this.RenderDisplayMenuText(menulayer);
			this.saveLayer();
		}

		this.setLayer();
		this.SetShadow();
		this.drawLayer(textlayer);
		this.drawLayer(menulayer);
	}
	function MouseDelta(x, y)
	{

	}
	truss_o.extendModule(cViewDebug, "view.Debug", ["view.Interface", "view.Layers", "objects.Tree", "view.Structure", "core.runtime", "view.Menu", "extBlur"]);
}());