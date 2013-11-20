(function(){
	function cMenu(trs){
		trs.menu = { menuList:[], displayMenuName:'', displayMenu:undefined, displayMenuOrigin:{x:0, y:0}, displayMenuBounds:{mwidth:0, h:0}};
		

		trs.RenderMenu = RenderMenu;
		trs.AddDisplayMenu = AddMenu;
		trs.ShowMenu = function(name,x,y,monly){ShowMenu(this, name, x, y);};
		trs.HideMenu = HideMenu;
		trs.getActiveMenuName = function(){return this.menu.displayMenu;};
		trs.processInteractionMMove = processInteractionMMove;
		trs.processInteractionMMdown = processInteractionMMdown;
	}
	function HideMenu()
	{
		if(typeof this.menu.displayMenu === 'undefined')
			return;

		var menuO = this.menu.displayMenu;
		for (var i = 0; i < menuO.items.length; i++) {
			 menuO.items[i].selected = false;
		};

		this.menu.displayMenu = undefined;
		this.update();
	}
	function AddMenu(menuName, menuObject)
	{
		menuObject.name = menuName;
		this.menu.menuList.push(menuObject);
	}
	function GetDisplayMenu(trs, menuName)
	{
		for (var i = 0; i < trs.menu.menuList.length; i++) {
			if(trs.menu.menuList[i].name == menuName)
				return trs.menu.menuList[i];
		};
		return undefined;
	}
	function ShowMenu(trs, menuName, x, y)
	{
		var menuO = GetDisplayMenu(trs, menuName);
		if(typeof menuO === 'undefined')
			return;
		trs.menu.displayMenuName = menuName;
		trs.menu.displayMenu = menuO;
		trs.menu.displayMenuOrigin.x = x;
		trs.menu.displayMenuOrigin.y = y;
		trs.update();
	}
	function RenderMenu(layerText, layerFront)
	{
		RenderMenuText(this, layerText, true);
		RenderMenuBackground(this, layerFront);
		RenderMenuText(this, layerText, false);
	}
	function RenderMenuText(trs, layer, measureOnly)
	{
		var menuO = trs.menu.displayMenu;
		if(menuO){
			trs.setLayer(layer);
			trs.SetShadow();
			trs.context.font = "8pt Verdana";
			trs.context.textBaseline ="top";
			trs.context.textAlign = 'start';
			trs.context.fillStyle = "rgb(255, 255, 255)";

			
			var x = trs.menu.displayMenuOrigin.x + 4;
			var y = trs.menu.displayMenuOrigin.y;

			for (var i = 0; i < menuO.items.length; i++) {
				var item = menuO.items[i];
				var dim = trs.context.measureText(item.text);
				trs.menu.displayMenuBounds.mwidth = Math.max(trs.menu.displayMenuBounds.mwidth, dim.width + 8);
				if(!measureOnly)
					trs.context.fillText(item.text, x, y+=2);

				trs.menu.displayMenuBounds.h = 10+4;// ??
				y+=10+4;
			}
			//trs.saveLayer();
		}
	}
	function RenderMenuBackground(trs, layer)
	{
		trs.setLayer(layer);
		var menuO = trs.menu.displayMenu;
		if(menuO){
			var x = trs.menu.displayMenuOrigin.x;
			var y = trs.menu.displayMenuOrigin.y;
			var mw = trs.menu.displayMenuBounds.mwidth;

			trs.SetShadow();
			//trs.SetShadow(2,2,6,"rgba(0, 0, 0, 0.8)");
			var bounds = {w:0,h:0};
			for (var i = 0; i < menuO.items.length; i++) {
				var item = menuO.items[i];

				if(item.selected)
					trs.context.fillStyle = "rgba(255, 187, 40, 0.8)";
				else
					trs.context.fillStyle = "rgba(111, 111, 111, 0.8)";
				item.x = x;
				item.y = y+(i*16);
				item.w = mw>0?mw:96;
				item.h = 16;
				trs.context.fillRect(item.x, item.y, item.w, item.h);
				bounds.h+=item.h;
				bounds.w=item.w;
			};
			//trs.saveLayer();
		}
	}
	function processInteractionMMove(mx,my){
		if(this.menu.displayMenu)
		{
			var updateAfter = false;
			var menuO = this.menu.displayMenu;
			for (var i = 0; i < menuO.items.length; i++) {
				var item = menuO.items[i];
				if(item.text[0] != '-' && hittestrect(item.x,item.y,item.w,item.h,mx,my))
				{
					if(!item.selected)
						updateAfter=true;

					item.selected = true;
				}else{
					if(item.selected)
						updateAfter=true;
					
					item.selected = false;
				}
			};
			if(updateAfter)
				this.update();
		}
	}
	function processInteractionMMdown(button,mx,my){
		if(this.menu.displayMenu)
		{
			var updateAfter = false;
			var menuO = this.menu.displayMenu;
			var index = -1;
			for (var i = 0; i < menuO.items.length; i++) {
				var item = menuO.items[i];
				if(hittestrect(item.x,item.y,item.w,item.h,mx,my))
				{
					item.selected = true;
					index = i;
				}else{
					item.selected = false;
				}
			};
			if(index>=0)
			{
				if(menuO.items[index].text[0] == '-')
					return true;
				this.HideMenu();
				callback = menuO.items[index].callback;

				if(typeof callback !== "undefined" && this.isFunction(callback))
					callback.call(this);

				this.update();
				return true;
			}
		}
		return false;
	}
	function hittestrect(x,y,w,h,hitX,hitY) {
		return(x<hitX&&x+w>=hitX&&y<hitY&&y+h>=hitY);
	}
	truss_o.extendModule(cMenu, "view.Menu", ["view.Input", "view.Interface", "core.Events", "core.runtime"]);
}());