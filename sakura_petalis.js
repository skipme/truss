(function(){
	//"use strict";
	var backgroundlayer = 'SPetalis.background';
	var menulayer ='SPetalis.menu';

	function cPetalis(trs)
	{
		var iface = {
			Render:Render,
			update:update
		};
		trs.addViewEngine("SakuraPetalis", iface);
		trs.setViewEngine("SakuraPetalis");
		trs.addLayer(menulayer);

		var r = trs.runtime;
		r.spetalis = { petalis: [], directionVectors: [], wind: {x: 5, y: 5, speed: 0.24}, dt: 0, 
		lastInvDate: new Date(), atlasIds: [], invFooDirection: true, flowBatAwait: [] };
		
		// load images 
		var imgId = trs.LoadImage('img/petalis.png');
		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 11,13, 89,82));
		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 126,13, 79,82));
		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 243,13, 91,104));

		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 7,137, 101,102));
		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 120,149, 99,90));
		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 237,149, 100,109));

		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 232,261, 113,130));
		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 123,266, 89,87));
		r.spetalis.atlasIds.push(trs.AddAtlas(imgId, 9,270, 95,88));

		r.spetalis.background = { b1: -1, b2: -1};
		// r.spetalis.background.b1 = trs.LoadImage('img/bg1.png');
		// r.spetalis.background.b2 = trs.LoadImage('img/bg2.png');
		//r.spetalis.background.b3 = trs.LoadImage('img/cherry_blossom_way_by_photosynthetique-d15f5nd.jpg');
		r.spetalis.background.b3 = trs.LoadImage('img/KUx_Ev0KXHI.jpg');

		prepareVectors(r.spetalis);
		preparePetalis(r.spetalis, trs.bounds);

		trs.CreateTimer(1000/30, petalisIteration);
		trs.CreateTimer(1000/4, petalisIterationW);
		trs.CreateTimer(1000/30, petalisIterationA);

		console.log(r.spetalis);

		trs.AddDisplayMenu("petalisMenu", {items:[
			{text: 'the links below will opened in this tab', callback: null},
			{text:'all coded by cerriun', callback: function(){window.location.href='https://github.com/skipme';}}, 
			//{text:'background by photosynthetique.deviantart.com', callback: function(){window.location.href='http://photosynthetique.deviantart.com/art/Cherry-Blossom-Way-69571417';}}, 
			]});
		trs.canvas.oncontextmenu = function() {
     		return false;  
		} 
		trs.addEventListener("mousedown", function(e)
			{
				if(e.which != 1)
				{
					var mx = e.pageX-this.bounds.left;
					var my = e.pageY-this.bounds.top;
					this.ShowMenu("petalisMenu", mx, my);
				}
			});
	}
	function prepareVectors(spetalis)
	{
		for (var i = 0; i < 200; i++) 
		{
			var dv = {x: rnd(-5,5), y: rnd(-5,5), maxX: 0, maxY: 0, minX: 0, minY: 0, incDX: true, incDY: true};
			if(dv.x === 0 )dv.x = 1;
			if(dv.y === 0 )dv.y = 1;
			dv.maxX = dv.x*1.5;
			dv.maxY = dv.y*1.5;

			dv.minX = dv.x -(dv.maxX - dv.x);
			dv.minY = dv.y -(dv.maxY - dv.y);

			spetalis.directionVectors.push(dv);
		};
		for (var i = 0; i < 5; i++) 
		{
			spetalis.flowBatAwait.push(rnd(5000,20000));
		};
	}
	function preparePetalis(spetalis,bounds)
	{
		for (var i = 0; i < 500; i++) {
			spetalis.petalis.push(createFolium(spetalis, bounds));
		};
	}
	function createFolium(spetalis, bounds)
	{
		var folium = { dVector: (rnd(0, spetalis.directionVectors.length)-1), windforce: .1, 
			atlas: (rnd(0, spetalis.atlasIds.length)-1), angle: {now: rnd(0,120), isInc: true}, x: rnd(0,bounds.width), y: rnd(0,bounds.height)
			, opacity: rnd(1,20), wait_until: (new Date) + rnd(0, 1000)
			};

		return folium;
	}
	function petalisIteration()
	{
		var spetalis = this.runtime.spetalis;
		var nw = (new Date);
		spetalis.dt = (nw - spetalis.lastInvDate);
		
		// adjust dt
		if(spetalis.dt > 100)
		{
			//spetalis.dt %= 10000;
			//spetalis.dt=5000;
			spetalis.lastInvDate = nw;
			spetalis.invFooDirection = !spetalis.invFooDirection;
		}
		var dti = spetalis.dt / 100;
		for (var i = 0; i < spetalis.petalis.length; i++) {
			foliumIteration(spetalis, spetalis.petalis[i], dti, this.bounds);
		};
		this.update();
	}
	
	function foliumIteration(spetalis, folium, dt, bounds)
	{
		// console.log(folium.wait_until)
		if(folium.wait_until > Date.now())
		{
			// console.log('gap')
			return;
		}

		var dv = back(dt,1);

		// folium.angle = dv * 120;

		var vec = spetalis.directionVectors[folium.dVector];
		var wind = spetalis.wind;
		folium.x +=(vec.x+spetalis.wind.x)*wind.speed;//+dv*rnd(0,4);
		folium.y +=(vec.y+spetalis.wind.y)*wind.speed;//+dv*rnd(0,4);
		

		if(folium.x > bounds.width)
		{
			folium.x = 0;
			folium.wait_until = Date.now();
			folium.wait_until += spetalis.flowBatAwait[rnd(0, spetalis.flowBatAwait.length)-1];//rnd(0, 20000);
			
		}
		if(folium.y > bounds.height)
		{
			folium.y = 0;
			folium.wait_until = Date.now();
			folium.wait_until += spetalis.flowBatAwait[rnd(0, spetalis.flowBatAwait.length)-1];//rnd(0, 20000);
		}

		if(folium.x < 0)
		{
			folium.x = bounds.width;
		}
		if(folium.y < 0)
		{
			folium.y = bounds.height;
		}
	}
	function petalisIterationA()
	{
		var spetalis = this.runtime.spetalis;
		var nw = (new Date);
		spetalis.dt = (nw - spetalis.lastInvDate);

		var dv = bounce(spetalis.dt/ 100);
		dv = Math.abs(dv);
		//if(dv>1)dv=1;
		dv*=3;
		for (var i = 0; i < spetalis.petalis.length; i++) {
			var folium = spetalis.petalis[i];
			if(folium.angle.isInc)
			{
				folium.angle.now +=dv;
				if(folium.angle > 120)
					folium.angle.isInc=false;
			}else{
				folium.angle.now -=dv;
				if(folium.angle < 0)
					folium.angle.isInc=true;
			}

		}
	}
	function petalisIterationW()
	{
		var spetalis = this.runtime.spetalis;
		var nw = (new Date);
		spetalis.dt = (nw - spetalis.lastInvDate);

		var dv = bounce(spetalis.dt/ 100);
		dv = Math.abs(dv);
		if(dv>1)dv=1;

		for (var i = 0; i < spetalis.directionVectors.length; i++) {
			var dvec = spetalis.directionVectors[i];
			
			if(dvec.incDY)dvec.y +=dv ;
			if(dvec.incDX) dvec.x +=dv ;
			if(!dvec.incDX)dvec.x -=dv ;
			if(!dvec.incDY)dvec.y -=dv ;
			if(dvec.x >= dvec.maxX)
			{
				dvec.incDX = false;
				dvec.x = dvec.maxX;
			}
			if(dvec.y >= dvec.maxY)
			{
				dvec.incDY = false;
				dvec.x = dvec.maxY;
			}
			if(dvec.x <= dvec.minX)
			{
				dvec.incDX = true;
				dvec.x = dvec.minX;
			}
			if(dvec.y <= dvec.minY)
			{
				dvec.incDY = true;
				dvec.y = dvec.minY;
			}
		};
	}
	function foliumIterationW(spetalis, folium, dt, bounds)
	{
		//folium.dVector = rnd(0, spetalis.directionVectors.length)-1;
	}
	function drawSpetalis(trs, spetalis)
	{
		// trs.context.globalCompositeOperation = "lighter";
		var dn = Date.now();
		for (var i = 0; i < spetalis.petalis.length; i++) {
			var folium = spetalis.petalis[i];
			if(folium.wait_until > dn)
			{
				continue;
			}
	  		trs.context.globalAlpha = folium.opacity/20;
	  		//trs.DrawAtlas(folium.atlas, folium.x, folium.y, 10, 10);
	  		trs.DrawAtlasAngle(folium.atlas, folium.x, folium.y, 10, 10, folium.angle.now);
		};
		trs.context.globalAlpha = 1;
		trs.context.globalCompositeOperation = "source-over";
	}
	function update()
	{
		// this.invalidateLayer(textlayer);
		this.invalidateLayer(menulayer);
	}
	function Render()
	{
		this.setLayer();
		this.Clear();
		//

		//
		var spetalis = this.runtime.spetalis;
		//
		this.DrawImage(spetalis.background.b3, 0,0, this.bounds.width, this.bounds.height);
		//
		drawSpetalis(this, spetalis);
		this.postEffectA();
		//
		//this.DrawImage(spetalis.background.b2, 0,0, this.bounds.width, this.bounds.height);
		//
		this.context.fillStyle = "#ffffff";
		this.SetShadow(0,0,6,"#000000");
		this.context.fillText(' you are using html5 canvas  ' +this.fps.rate.toFixed(2)+' fps', 14,14);
		//this.context.fillText('', 14, this.bounds.height - 96);
		this.SetShadow();

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
		this.drawLayer(menulayer);
	}
	//
	function rnd(min,max)
	{
		return min + Math.floor((Math.random()*(max-min)+1));
	}
	function back(progress, x) 
	{
	    return Math.pow(progress, 2) * ((x + 1) * progress - x)
	}
	function elastic(progress, x) {
	  return Math.pow(2, 10 * (progress-1)) * Math.cos(20*Math.PI*x/3*progress)
	}
	function bounce(progress) {
	  for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
	    if (progress >= (7 - 4 * a) / 11) {
	      return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
	    }
	  }
	}
	truss_o.extendModule(cPetalis, "view.SakuraPetalis", ["view.Interface", "view.Layers", "objects.Tree", "view.Structure", "core.runtime", "view.Menu", "extBlur"]);
}());