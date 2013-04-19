(function(){
	//"use strict";

	var TO_RADIANS = Math.PI/180; 

	function vImage(trs){
		trs.runtime.images = { objects: [], atlases: [], loaded: [] };
		trs.LoadImage = load;
		trs.AddAtlas = addAtlas;
		trs.DrawAtlas = drawAtlas;
		trs.DrawAtlasAngle = drawAtlasRotated;
		trs.DrawImage = drawImage;
		trs.ImageLoaded = checkLoaded;
	}
	function checkLoaded(index)
	{
		return this.runtime.images.loaded[index];
	}
	function load(location)
	{
		var img = new Image();   // Создаём новый объект Image
		img.src = location; // Устанавливаем путь к источнику
		var index = this.runtime.images.objects.length;
		var trs = this;
		img.onload = function(){
			trs.runtime.images.loaded[index] = true;
			console.log("image loaded: "+ location);
		};
		this.runtime.images.loaded.push(false);
		this.runtime.images.objects.push(img);
		return this.runtime.images.objects.length -1;
	}
	function drawImage(imgId, dx, dy, dw, dh)
	{
		if(imgId < 0 || !this.ImageLoaded(imgId))
			return;
		this.context.drawImage(this.runtime.images.objects[imgId], dx, dy, dw, dh);
	}
	function addAtlas(imgId, sx, sy, sw, sh)
	{
		var atlas = {i:imgId, sx: sx, sy: sy, sw: sw, sh: sh};
		this.runtime.images.atlases.push(atlas);
		return this.runtime.images.atlases.length -1;
	}
	function drawAtlas(atlasId, dx, dy, dw, dh)
	{
		if(atlasId < 0)
			return;
		var a = this.runtime.images.atlases[atlasId];
		this.context.drawImage(this.runtime.images.objects[a.i], a.sx, a.sy, a.sw, a.sh, 
			dx, dy, dw, dh);
	}
	function drawAtlasRotated(atlasId, dx, dy, dw, dh, angle)
	{
		if(atlasId < 0)
			return;
		var a = this.runtime.images.atlases[atlasId];
		this.context.save(); 
		//
		this.context.translate(dx, dy);
		this.context.rotate(angle * TO_RADIANS);
		this.context.drawImage(this.runtime.images.objects[a.i], a.sx, a.sy, a.sw, a.sh, 
			0, 0, dw, dh);
		this.context.restore(); 
	}
	truss_o.extendModule(vImage, "view.Images", ["view.Interface", "view.Layers", "core.Events", "core.runtime"]);
}());