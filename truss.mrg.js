/*******************/

var truss_o; 

(function(){
  //"use strict";
  //common
  var default_options = {test:"hello", test2:"world"};
  var log = function(msg){console.log(msg);};
  //extension & events
  var extendFunctions = [];

  function setOption (key, defaultvalue, force){
    if(key.indexOf('.')===-1){
        if(force || (this.options[key] === null || typeof this.options[key] === "undefined"))
         { this.options[key]=defaultvalue;}
    } else {
      var ks = key.split('.');
      var curopt =  this.options;
      for (var i = 0; i < ks.length-1; i++) {
        if(ks[i] === null || typeof ks[i] === "undefined")
         { throw 'The property path not well formed: ' + key + " defaultval: " + defaultvalue;}
        if(typeof curopt[ks[i]] === "undefined")
         { curopt[ks[i]] = {};}
        curopt = curopt[ks[i]];
      };

      curopt[ks[ks.length - 1]] = defaultvalue;
    }
  }
  function extendFunction(extendFunction, name, after){
    extendFunctions.push({name:name, after:after, foo:extendFunction});
  }
  function rnd(min,max)
  {
    return min + Math.floor((Math.random()*(max-min)+1));
  }
  function clone(o) {
     if(!o || 'object' !== typeof o)  {
       return o;
     }
     var c = 'function' === typeof o.pop ? [] : {};
     var p, v;
     for(p in o) {
     if(o.hasOwnProperty(p)) {
      v = o[p];
      if(v && 'object' === typeof v) {
        c[p] = clone(v);
      }
      else {
        c[p] = v;
      }
     }
    }
     return c;
  }
  
  function createFromCanvas(canvas)
  {
    var newtruss = clone(this);
    newtruss.canvas = canvas;
    newtruss.context = canvas.getContext("2d");

    registrateExtensionsFull(newtruss);
    
    delete newtruss.create;
    delete newtruss.extendModule;

    return newtruss;
  }

  function registrateExtensionsFull(newtruss)
  {
      var done;
      var prevreg = 0;
      while(!done)
      {
        done = registrateExtensions(newtruss);
        if(!done)
        {
          if(newtruss.options.registered.length == prevreg)
            throw 'missed some module';
        }
        prevreg = newtruss.options.registered.length;
      }
      log('extended by '+extendFunctions.length+" modules");
  }
  function registrateExtensions(newtruss)
  {
    // extend by all registered extensions
    var allregistered = true;
    newtruss.option("registered", new Array());
    var registered = newtruss.options.registered;

    for (var i = 0; i < extendFunctions.length; i++) {
      if(registered.indexOf(extendFunctions[i].name)>=0){continue;}
      
      var passed = true;
      if(typeof extendFunctions[i].after === "string")
      {
        if(registered.indexOf(extendFunctions[i].after)>=0)
        {
          passed = true;
        } else {
          passed=false;
        }
      } else if(typeof extendFunctions[i].after === "object")
      {
        passed = true;
        for (var j = 0; j < extendFunctions[i].after.length; j++) {
          if(registered.indexOf(extendFunctions[i].after[j])<0)
          {
            passed = false;
            break;
          }
        }
      } else if(typeof extendFunctions[i].after==="undefined") {
          passed = true;
      }

      if(passed) {
        extendFunctions[i].foo(newtruss);
        registered.push(extendFunctions[i].name);
        log('extended by '+extendFunctions[i].name);
      } else {
        allregistered = false;
      }
    }
    return allregistered;
  }

  function sayFunction(){log(this.options.test+' '+this.options.test2)};
  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  } 
  
  uuid = (function() {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 
   
    return function (len, radix) {
      var chars = CHARS, uuid = [], rnd = Math.random;
      radix = radix || chars.length;
   
      if (len) {
        // Compact form
        for (var i = 0; i < len; i++) uuid[i] = chars[0 | rnd()*radix];
      } else {
        // rfc4122, version 4 form
        var r;
   
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
   
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (var i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | rnd()*16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
          }
        }
      }
   
      return uuid.join('');
    };
  })();

  truss_o = {
    version: "0.1 devTool",
    options: default_options,
    option: setOption,
    say: sayFunction,
    rndm: rnd,
    extendModule: extendFunction,
    create: createFromCanvas,
    isFunction: isFunction,
    uuid: uuid,
    log: log
  }

  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
  })();
}());
// "aaab.js"
// "animate.js"
(function(){

	var fpsFilter = 10;
	function cAnimate(trs){
		trs.fps = {};
		trs.fps.rate = 0; trs.fps.now = 0; trs.fps.lastUpdate = (new Date())*1 - 1;
		trs.addEvent('Render');
		trs.addEvent('update');

		trs.StopAnim = false;
		trs.SuspendFrame = false;
		trs.animFrame = Frame;
		trs.option('animFps', 30); 
		trs.animFPS = 0; 


		//function explicitframe(){Frame(trs);}
		//trs.runtime.anim_interval = setInterval(explicitframe, 1000 / trs.options.animFps);
		
		implicitframe(trs);

		trs.timers = [];
		trs.CreateTimer = CreateTimer;
		
		trs.uselessFrames = 500;
		trs.suspendAnimation = Suspend;
		trs.update = Update;
	}
	function Frame(trs)
	{
		trs.fps.now=new Date();
		var thisFrameFPS = 1000.0 / (trs.fps.now - trs.fps.lastUpdate);
		if(isNaN(thisFrameFPS))
			thisFrameFPS = 0.1;

  		trs.fps.rate += (thisFrameFPS - trs.fps.rate) / fpsFilter;
		if(isNaN(trs.fps.rate))
			trs.fps.rate = 0.1;
  		//if(trs.fps.rate)
  		trs.fps.lastUpdate = trs.fps.now;
  			
		if(!trs.StopAnim)
		{
			if(trs.uselessFrames<=-5){
				trs.suspendAnimation();
			}
			trs.invokeEvent('Render');
			trs.uselessFrames--;
		}
	}
	function CreateTimer(interval,callback)
	{
		var self = this;
		var tID = setInterval(function(){callback.call(self);}, interval);
		this.timers.push(tID);
	}
	function explicitframe(trs){
		trs.animFrame(trs);
	}
	function implicitframe(trs){
		explicitframe(trs); 
		if(!trs.SuspendFrame){
			requestAnimFrame(function(){implicitframe(trs);});
		}
	}
		
	function Suspend()
	{
		this.SuspendFrame = true;
	}
	function Update()
	{
		if(this.SuspendFrame)
		{
			this.SuspendFrame = false;
			this.uselessFrames = 30;
			implicitframe(this);
			console.log("frame loop-->");
		}
		else
		{
			this.uselessFrames = 30;
		}
		this.invokeEvent('update');
	}
	truss_o.extendModule(cAnimate, "core.Animate", ["core.Events", "core.runtime"]);
}());// "button.js"
(function(){
		function vButton(trs){
			trs.Button = {
				buttons: [
				{
					x:0, y: 0, w: 0, h: 0, 
					visible: 1, interaction: interactionInput, focus: 0, hover: false, switched: false, 
					render: renderButton,
					caption: "OK", font: "12px Verdana", fontheight: 12 
				}],
				buttonNames: []
			}; 
			trs.addButton = addButton;
		}
		function setTextParams(trs, button)
		{
			//trs.SetShadow();
			trs.context.font = button.font;
			trs.context.textBaseline = "bottom";// "top";
			trs.context.textAlign = 'start';
			if(button.hover)
				trs.SetShadow(0,0,4, button.hovercolor);//trs.SetShadow(0,0,4,"rgb(255, 187, 40)");
			else 
				trs.SetShadow();

			trs.context.fillStyle = button.hover?"rgba(255, 255, 255, 1)" :"rgba(111, 111, 111, 1)";//"rgb(0, 0, 0)";
		}
		function renderButton(trs)
		{
			var button = this;
			trs.SetShadow();
			// var colour = 
		// 'hsla(' + Math.round(Math.random() * 360) + ', 80%, 60%'+ ',0.7)';
			if(button.drawbackground){
				trs.context.fillStyle =  "rgba(37, 51, 62, .8)";//"rgba(255, 187, 40, 1)";//"rgba(255, 255, 255, 0.6)";
				trs.context.fillRect(button.x, button.y, button.w, button.h);
			}
			setTextParams(trs, button);
			trs.context.fillText(button.caption, button.x + 2, button.y + button.h - 2);

			trs.SetShadow();
		}
		function interactionInput(trs,keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove)
		{
			if(mouseMove !== null)
			{
				var e = mouseMove;
				var mx = trs.runtime.mx;
				var my = trs.runtime.my;

				if(this.hover = hittestrect(this.x, this.y, this.w, this.h, mx, my))
				{ 
					trs.setCursor("pointer")
				}
			}else if (mouseUp !== null)
			{
				var e = mouseUp;
				var mx = trs.runtime.mx;
				var my = trs.runtime.my;

				if(hittestrect(this.x, this.y, this.w, this.h, mx, my))
				{ 
					if(typeof this.callback !== "undefined" && trs.isFunction(this.callback))
						this.callback.call();
				}
			}
		}
		function hittestrect(x,y,w,h,hitX,hitY) {
			return(x<hitX&&x+w>=hitX&&y<hitY&&y+h>=hitY);
		}
		function addButton(name, caption, font, fontheight, callback)
		{
			this.Button.buttonNames[name] = this.Button.buttons.length;
			var button = {
					x:0, y: 0, w: 0, h: 0, 
					visible: 1, interaction: interactionInput, focus: 0, hover: false, switched: false, 
					hovercolor: "rgb(40, 187, 255)", drawbackground: true,
					render: renderButton,
					caption: caption, font: font, fontheight: fontheight, callback: callback
			};
			this.Button.buttons.push(button);
			return button;
		}
		truss_o.extendModule(vButton, "view.Button", ["view.Interface", "core.runtime"]);
}());// "cmenu.js"
(function(){
	function cMenu(trs){
		trs.menu = { menuList:[], displayMenuName:undefined, displayMenu:undefined, displayMenuOrigin:{x:0, y:0}, displayMenuBounds:{mwidth:0, h:0}};
		

		trs.RenderMenu = RenderMenu;
		trs.AddDisplayMenu = AddMenu;
		trs.ShowMenu = function(name,x,y,monly){ShowMenu(this, name, x, y);};
		trs.HideMenu = HideMenu;
		trs.getActiveMenuName = function(){return this.menu.displayMenuName;};
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
		this.menu.displayMenuName = undefined;
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
}());// "dispatcher_simple.js"
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
					if(data == this.selectedNode)
						this.selectedNode = -1;
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
}());// "events.js"

(function(){
	//"use strict";
	function cEvents(trs){
		trs.Events = {};

		trs.addEvent = addEvent;
		trs.addEventCallback = addEventCallback;
		trs.clearEventCallbacks = clearEventCallbacks;
		trs.invokeEvent = invokeEvent;
		trs.addEventListener = AddEventOnElement;
	}
	function addEvent(name)
	{
		if(typeof this.Events[name]==="undefined"||this.Events[name]===null)
			this.Events[name] = new Array();
		else throw 'the event '+name+' already registered';
	}
	function addEventCallback(name,foo)
	{
		if(typeof this.Events[name]==="undefined"||this.Events[name]===null)
			{throw 'the event '+name+' not registered';}
		else {this.Events[name].push(foo);}
	}
	function clearEventCallbacks(name)
	{
		if(typeof this.Events[name]==="undefined"||this.Events[name]===null)
			{throw 'the event '+name+' not registered';}
		else {this.Events[name] = new Array();}
	}
	function invokeEvent(name,farguments)
	{
		var ev = this.Events[name];
		if(typeof ev==="undefined"||ev===null)
			{throw 'the event '+name+' not registered';}
		else 
		{
			for (var i = 0; i < ev.length; i++) {
				ev[i].apply(this, farguments);
			};
		}
	}
	function AddEventOnElement(etype, foocallback)
	{
		var self = this;
		var target = this.canvas;
		//if(etype=="mousemove")
		//	target = window;
		if(etype=="mouseup" /*|| etype=="keydown"|| etype=="keypress"*/)
			target = document;
		target.addEventListener(etype, function(a,b,c){foocallback.apply(self, [a,b,c]);}, false);
		this.log('registerd evt listener '+etype);
	}
	truss_o.extendModule(cEvents, "core.Events");
}());// "extblurF.js"
(function(){
	function extBlur(trs){
		trs.blurCanvas = function()
		{
			 boxBlurCanvasRGB(this.context, 0, 0, this.bounds.width, this.bounds.height, 2, 1);
		};
	}
	truss_o.extendModule(extBlur, "extBlur", "view.Interface");
	var mul_table = [ 1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1];
        
   
var shg_table = [0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18];

		
function boxBlurImage( imageID, canvasID, radius, blurAlphaChannel, iterations ){
			
 	var img = document.getElementById( imageID );
	var w = img.naturalWidth;
    var h = img.naturalHeight;
       
	var canvas = document.getElementById( canvasID );
      
    canvas.style.width  = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w;
    canvas.height = h;
    
    var context = canvas.getContext("2d");
    context.clearRect( 0, 0, w, h );
    context.drawImage( img, 0, 0 );

	if ( isNaN(radius) || radius < 1 ) return;
	
	if ( blurAlphaChannel )
	{
		boxBlurCanvasRGBA( canvasID, 0, 0, w, h, radius, iterations );
	} else {
		boxBlurCanvasRGB( canvasID, 0, 0, w, h, radius, iterations );
	}
	
}


function boxBlurCanvasRGBA( context, top_x, top_y, width, height, radius, iterations ){
	if ( isNaN(radius) || radius < 1 ) return;
	
	radius |= 0;
	
	if ( isNaN(iterations) ) iterations = 1;
	iterations |= 0;
	if ( iterations > 3 ) iterations = 3;
	if ( iterations < 1 ) iterations = 1;
	
	//var canvas  = document.getElementById( id );
	//var context = canvas.getContext("2d");
	var imageData;
	
	try {
	  try {
		imageData = context.getImageData( top_x, top_y, width, height );
	  } catch(e) {
	  
		// NOTE: this part is supposedly only needed if you want to work with local files
		// so it might be okay to remove the whole try/catch block and just use
		// imageData = context.getImageData( top_x, top_y, width, height );
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			imageData = context.getImageData( top_x, top_y, width, height );
		} catch(e) {
			alert("Cannot access local image");
			throw new Error("unable to access local image data: " + e);
			return;
		}
	  }
	} catch(e) {
	  alert("Cannot access image");
	  throw new Error("unable to access image data: " + e);
	  return;
	}
			
	var pixels = imageData.data;
		
	var rsum,gsum,bsum,asum,x,y,i,p,p1,p2,yp,yi,yw,idx,pa;		
	var wm = width - 1;
  	var hm = height - 1;
    var wh = width * height;
	var rad1 = radius + 1;
    
	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];

	var r = [];
    var g = [];
    var b = [];
	var a = [];
	
	var vmin = [];
	var vmax = [];
  
	while ( iterations-- > 0 ){
		yw = yi = 0;
	 
		for ( y=0; y < height; y++ ){
			rsum = pixels[yw]   * rad1;
			gsum = pixels[yw+1] * rad1;
			bsum = pixels[yw+2] * rad1;
			asum = pixels[yw+3] * rad1;
			
			
			for( i = 1; i <= radius; i++ ){
				p = yw + (((i > wm ? wm : i )) << 2 );
				rsum += pixels[p++];
				gsum += pixels[p++];
				bsum += pixels[p++];
				asum += pixels[p]
			}
			
			for ( x = 0; x < width; x++ ) {
				r[yi] = rsum;
				g[yi] = gsum;
				b[yi] = bsum;
				a[yi] = asum;

				if( y==0) {
					vmin[x] = ( ( p = x + rad1) < wm ? p : wm ) << 2;
					vmax[x] = ( ( p = x - radius) > 0 ? p << 2 : 0 );
				} 
				
				p1 = yw + vmin[x];
				p2 = yw + vmax[x];
				  
				rsum += pixels[p1++] - pixels[p2++];
				gsum += pixels[p1++] - pixels[p2++];
				bsum += pixels[p1++] - pixels[p2++];
				asum += pixels[p1]   - pixels[p2];
					 
				yi++;
			}
			yw += ( width << 2 );
		}
	  
		for ( x = 0; x < width; x++ ) {
			yp = x;
			rsum = r[yp] * rad1;
			gsum = g[yp] * rad1;
			bsum = b[yp] * rad1;
			asum = a[yp] * rad1;
			
			for( i = 1; i <= radius; i++ ) {
			  yp += ( i > hm ? 0 : width );
			  rsum += r[yp];
			  gsum += g[yp];
			  bsum += b[yp];
			  asum += a[yp];
			}
			
			yi = x << 2;
			for ( y = 0; y < height; y++) {
				
				pixels[yi+3] = pa = (asum * mul_sum) >>> shg_sum;
				if ( pa > 0 )
				{
					pa = 255 / pa;
					pixels[yi]   = ((rsum * mul_sum) >>> shg_sum) * pa;
					pixels[yi+1] = ((gsum * mul_sum) >>> shg_sum) * pa;
					pixels[yi+2] = ((bsum * mul_sum) >>> shg_sum) * pa;
				} else {
					pixels[yi] = pixels[yi+1] = pixels[yi+2] = 0;
				}				
				if( x == 0 ) {
					vmin[y] = ( ( p = y + rad1) < hm ? p : hm ) * width;
					vmax[y] = ( ( p = y - radius) > 0 ? p * width : 0 );
				} 
			  
				p1 = x + vmin[y];
				p2 = x + vmax[y];

				rsum += r[p1] - r[p2];
				gsum += g[p1] - g[p2];
				bsum += b[p1] - b[p2];
				asum += a[p1] - a[p2];

				yi += width << 2;
			}
		}
	}
	
	context.putImageData( imageData, top_x, top_y );
	
}

function boxBlurCanvasRGB( context, top_x, top_y, width, height, radius, iterations ){
	if ( isNaN(radius) || radius < 1 ) return;
	
	radius |= 0;
	
	if ( isNaN(iterations) ) iterations = 1;
	iterations |= 0;
	if ( iterations > 3 ) iterations = 3;
	if ( iterations < 1 ) iterations = 1;
	
	//var canvas  = document.getElementById( id );
	//var context = canvas.getContext("2d");
	var imageData;
	
	try {
	  try {
		imageData = context.getImageData( top_x, top_y, width, height );
	  } catch(e) {
	  
		// NOTE: this part is supposedly only needed if you want to work with local files
		// so it might be okay to remove the whole try/catch block and just use
		// imageData = context.getImageData( top_x, top_y, width, height );
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			imageData = context.getImageData( top_x, top_y, width, height );
		} catch(e) {
			alert("Cannot access local image");
			throw new Error("unable to access local image data: " + e);
			return;
		}
	  }
	} catch(e) {
	  alert("Cannot access image");
	  throw new Error("unable to access image data: " + e);
	  return;
	}
			
	var pixels = imageData.data;
		
	var rsum,gsum,bsum,asum,x,y,i,p,p1,p2,yp,yi,yw,idx;		
	var wm = width - 1;
  	var hm = height - 1;
    var wh = width * height;
	var rad1 = radius + 1;
   
	var r = [];
    var g = [];
    var b = [];
	
	var mul_sum = mul_table[radius];
	var shg_sum = shg_table[radius];
	
	var vmin = [];
	var vmax = [];
  
	while ( iterations-- > 0 ){
		yw = yi = 0;
	 
		for ( y=0; y < height; y++ ){
			rsum = pixels[yw]   * rad1;
			gsum = pixels[yw+1] * rad1;
			bsum = pixels[yw+2] * rad1;
			
			for( i = 1; i <= radius; i++ ){
				p = yw + (((i > wm ? wm : i )) << 2 );
				rsum += pixels[p++];
				gsum += pixels[p++];
				bsum += pixels[p++];
			}
			
			for ( x = 0; x < width; x++ ){
				r[yi] = rsum;
				g[yi] = gsum;
				b[yi] = bsum;
				
				if( y==0) {
					vmin[x] = ( ( p = x + rad1) < wm ? p : wm ) << 2;
					vmax[x] = ( ( p = x - radius) > 0 ? p << 2 : 0 );
				} 
				
				p1 = yw + vmin[x];
				p2 = yw + vmax[x];
				  
				rsum += pixels[p1++] - pixels[p2++];
				gsum += pixels[p1++] - pixels[p2++];
				bsum += pixels[p1++] - pixels[p2++];
				 
				yi++;
			}
			yw += ( width << 2 );
		}
	  
		for ( x = 0; x < width; x++ ){
			yp = x;
			rsum = r[yp] * rad1;
			gsum = g[yp] * rad1;
			bsum = b[yp] * rad1;
				
			for( i = 1; i <= radius; i++ ){
			  yp += ( i > hm ? 0 : width );
			  rsum += r[yp];
			  gsum += g[yp];
			  bsum += b[yp];
			}
			
			yi = x << 2;
			for ( y = 0; y < height; y++){
				pixels[yi]   = (rsum * mul_sum) >>> shg_sum;
				pixels[yi+1] = (gsum * mul_sum) >>> shg_sum;
				pixels[yi+2] = (bsum * mul_sum) >>> shg_sum;
		   
				if( x == 0 ) {
					vmin[y] = ( ( p = y + rad1) < hm ? p : hm ) * width;
					vmax[y] = ( ( p = y - radius) > 0 ? p * width : 0 );
				} 
				  
				p1 = x + vmin[y];
				p2 = x + vmax[y];

				rsum += r[p1] - r[p2];
				gsum += g[p1] - g[p2];
				bsum += b[p1] - b[p2];
				  
				yi += width << 2;
			}
		}
	}
	context.putImageData( imageData, top_x, top_y );
	
}
}());// "fonts.js"
(function(){
		function vFonts(trs){
			trs.fonts = {
				familys: []
			}; 
			trs.loadFont = loadFont;
		}
		function loadFont(name, src)
		{
			if(this.fonts.familys.indexOf(name)>=0)
				return name;

			var newStyle = document.createElement('style');
			var srcS = "src: ";
			for (var i = 0; i < src.length; i++) {
				srcS += (i>0?",":"") + "url(\"" + src[i] + "\") format(\"woff\")\n";
			};
			newStyle.appendChild(document.createTextNode(" \
			@font-face { \
  font-family: \""+ name +"\"; \
  "+srcS+"; \
  font-weight: normal; \
  font-style: normal; } \
			"));
			// src: url(\""+src+"\") format(\"woff\"); \
			document.head.appendChild(newStyle);
			this.fonts.familys.push(name);
			
			return name;
		}
		truss_o.extendModule(vFonts, "view.Fonts", ["view.Interface", "core.runtime"]);
}());// "history.js"
// "image.js"
(function(){
	//"use strict";

	var TO_RADIANS = Math.PI/180; 

	function vImage(trs){
		trs.runtime.images = { objects: [], atlases: [], loaded: [], textures: [] };

		trs.LoadImage = load;
		trs.AddAtlas = addAtlas;
		trs.DrawAtlas = drawAtlas;
		trs.DrawAtlasAngle = drawAtlasRotated;
		trs.DrawImage = drawImage;
		trs.ImageLoaded = checkLoaded;
		trs.CreateTexture = createTexture
		trs.DrawTexture = drawTexture;
	}
	function drawTexture(texture, dx, dy, dw, dh)
	{
		this.context.drawImage(texture, dx, dy, dw, dh);
	}
	function createTexture(w, h)
	{
		var img = this.runtime.images;
		var t = document.createElement("canvas");
		t.width  = w; t.height = h;

		img.textures.push(t);
		return t;
	}
	function checkLoaded(index)
	{
		return this.runtime.images.loaded[index];
	}
	function load(location, foo)
	{
		var img = new Image();   // Создаём новый объект Image
		img.src = location; // Устанавливаем путь к источнику
		var index = this.runtime.images.objects.length;
		var trs = this;
		img.onload = function(){
			trs.runtime.images.loaded[index] = true;
			console.log("image loaded: "+ location);
			if(typeof foo !== 'undefined')
			{
				foo.apply(trs, [trs.runtime.images.objects[index]]);
			}
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
}());// "input.js"
(function(){
	// binding foo -> event -> callbacks
	// foo (eventClass, eventData)

	//"use strict";
	function cInput(trs){
		trs.runtime.inputEventOut = 'input_ge';
		trs.runtime.inputEventPush = 'inpute_gp';

		trs.addEvent(trs.runtime.inputEventPush);
		trs.addEvent(trs.runtime.inputEventOut);

		trs.PushEvent = PushEvent;
		trs.DispatchEvents = DispatchEvents;

		// trs.addEventListener("keydown", onKeyDown);
		//trs.addEventListener("keypress", onKeyDown);
		trs.canvas.focus();
		trs.canvas.setAttribute('tabindex','0');
		//trs.canvas.setAttribute('contentEditable','true');

		// TODO: add keymapper: [{keyEnc:scodeToDispatch}]
	}
	function PushEvent(ktype, data){
		this.invokeEvent(this.runtime.inputEventOut, [ktype, data]);
	}
	function DispatchEvents(callback){
		this.addEventCallback(this.runtime.inputEventOut, callback);
	}
	function onKeyDown(e){
		//console.log('pressed '+e.keyCode+', ['+String.fromCharCode(e.keyCode) +']');

		e.preventDefault();
	}
	truss_o.extendModule(cInput, "view.Input", ["view.Interface", "core.Events", "core.runtime"]);
}());// "interactive.js"
// "layers.js"
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
}());// "metaspheres.js"
(function(){
	//"use strict";
	var threshold = 230;
	function metaSpheres(trs)
	{
		var r = trs.runtime;
		r.metaSpheres = { gradients: [], tex: trs.CreateTexture(trs.bounds.width, trs.bounds.height) };
	
		trs.MetaPrepareGradient = prepareOval;
		trs.MetaDrawGradient = drawOval;
		trs.MetaPostProcess = postProcess;
		trs.postEffectA = postEffectA;
		trs.postEffectA_ = postEffectA_;
		r.metaSpheres.patIMG = trs.LoadImage('img/pattern.png', function(image){
			r.metaSpheres.patFS = trs.context.createPattern(image, "repeat")
		});
		
	}
	function prepareOval(radius)
	{
		var tex = this.CreateTexture(radius * 2, radius * 2);
		var tctx = tex.getContext("2d");
		var grad = tctx.createRadialGradient(
                    radius,
                    radius,
                    1,
                    radius,
                    radius,
                    radius
                    );
		var colour = 
		'hsla(' + Math.round(Math.random() * 360) + ', 80%, 60%';
		// grad.addColorStop(0, 'rgba(255,255,255, 1)');
  //       grad.addColorStop(1, 'rgba(255,255,255, 0)');
        grad.addColorStop(0, colour + ',1)');
        grad.addColorStop(1, colour + ',0)');
        tctx.fillStyle = grad;
        tctx.beginPath();
        tctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
        tctx.closePath();
        tctx.fill();

        this.runtime.metaSpheres.gradients.push(tex);

        return this.runtime.metaSpheres.gradients.length - 1;
	}
	function drawOval(grad, x, y, w, h)
	{
		var grad = this.runtime.metaSpheres.gradients[grad];
		this.DrawTexture(grad, x-grad.width*.5, y-grad.height*.5, w, h);
	}
	function postProcess() 
	{
        var imageData = this.context.getImageData(0, 0, this.bounds.width, this.bounds.height),
            pix = imageData.data;

        for (var i = 0, n = pix.length; i < n; i += 4) {
            if(pix[i + 3] < threshold)(pix[i + 3] *= .2222);

        }

        this.context.putImageData(imageData, 0, 0);
    };
    function postEffectA()
    {
    	if(typeof this.runtime.metaSpheres.patFS === 'undefined')
    		return;
		 this.context.globalCompositeOperation = "xor";
		 this.context.fillStyle = this.runtime.metaSpheres.patFS;
		 this.context.fillRect(0, 0, this.bounds.width, this.bounds.height);
		 this.context.globalCompositeOperation = "source-over";
		 this.context.fillStyle = "rgb(255, 255, 255)"
    }
    function postEffectA_()
    {
    	var pixw = 4;
    	var skipp = false;

    	var skipx = false;
		var skipy = false;

        var imageData = this.context.getImageData(0, 0, this.bounds.width, this.bounds.height);
  //       var pix = imageData.data;
  //       var step = pix.length / pixw;
		// for (var i = 0; i < pix.length; i+=pixw) {
		// 	var index = i * 4;
		
		// 	for (var p = 0; p < pixw; p++) {
		// 		 pix[index +p*this.bounds.width + 4] = .02222;
		// 	};
		
		// };

		var o = conv(imageData, [ 1/2, 1/3, 1/4,
    1/5, 1/6, 1/6 ], 0, this.runtime.metaSpheres.tex);
		//(this.runtime.metaSpheres.tex.getContext('2d')).putImageData(o, 0, 0);
		//this.context.globalCompositeOperation = "lighter";
		//this.Clear();
		 //this.context.drawImage(this.runtime.metaSpheres.tex,0,0);
         this.context.putImageData(o, 0, 0);
    }
    function conv(pixels, weights, opaque,tex) {
	  var side = Math.round(Math.sqrt(weights.length));
	  var halfSide = Math.floor(side/2);
	  var src = pixels.data;
	  var sw = pixels.width;
	  var sh = pixels.height;
	  // pad output by the convolution matrix
	  var w = sw;
	  var h = sh;
	   var output = (tex.getContext('2d')).createImageData(w, h);
	   var dst = output.data;
	  //var dst = src;
	  // go through the destination image pixels
	  var alphaFac = opaque ? 1 : 0;
	  for (var y=0; y<h; y++) {
	    for (var x=0; x<w; x++) {
	      var sy = y;
	      var sx = x;
	      var dstOff = (y*w+x)*4;
	      // calculate the weighed sum of the source image pixels that
	      // fall under the convolution matrix
	      var r=0, g=0, b=0, a=0;
	      for (var cy=0; cy<side; cy++) {
	        for (var cx=0; cx<side; cx++) {
	          var scy = sy + cy - halfSide;
	          var scx = sx + cx - halfSide;
	          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
	            var srcOff = (scy*sw+scx)*4;
	            var wt = weights[cy*side+cx];
	            r += src[srcOff] * wt;
	            g += src[srcOff+1] * wt;
	            b += src[srcOff+2] * wt;
	            a += src[srcOff+3] * wt;
	          }
	        }
	      }
	      dst[dstOff] = r;
	      dst[dstOff+1] = g;
	      dst[dstOff+2] = b;
	      dst[dstOff+3] = a + alphaFac*(255-a);
	    }
	  }
	  return output;
	};
	truss_o.extendModule(metaSpheres, "view.Metaspheres", ["view.Images", "view.Interface", "view.Layers", "core.Events", "core.runtime"]);
}());// "mo-test.js"
truss_o.option('test2', "sayno");
truss_o.say();

truss_o.option('test2', "world");
truss_o.option('test3', "sayno");
truss_o.say();
// "objtree.js"
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
		trs.NodeDisposition = NodeDispositionAABB;
		trs.AABBboundsUpdate = AABBboundsUpdate;

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
	function AABBboundsUpdate(left, right, top, bottom)
	{
		this.aabb.x = Math.min(left + this.objs_translate.xoffset, this.aabb.x );
		this.aabb.y = Math.min(top + this.objs_translate.yoffset, this.aabb.y);
		this.aabb.max_x = Math.max(right + this.objs_translate.xoffset, this.aabb.max_x);
		this.aabb.max_y = Math.max(bottom + this.objs_translate.yoffset, this.aabb.max_y);
	}
	function NodeDispositionAABB(node)
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

// "proxypanel.js"
(function(){
		function vPanel(trs){
			trs.proxyPanel = { activepanel: {
				x: 0, y: 0, w: 0, h: 0,
				visibility: false,
				bindings: [
					{refName: 'i', relative: {x: 0, y: 0, right: 0, bottom: 18, xrule: 'left', yrule: 'top', rrule: 'left', brule: 'abs'}, proxy: {}}
				],
				addTextBox: addTextBox, addButton: addButton, getControl: getControl,
				Show: FadeIn, Hide: FadeOut
				},
			};
			trs.RenderProxyPanels = RenderProxyPanels;
			trs.showProxyPanel = showProxyPanel;
			trs.ProxyPanelInteractionEntry = interactionEntry;
		}
		function interactionEntry(keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove)
		{
			var panel = this.proxyPanel.activepanel;
			if(mouseDown !== null)
			{
				var e = mouseDown;
				var mx = this.runtime.mx;
				var my = this.runtime.my;
				// set caret position
				// assume drag over point

				if(hittestrect(panel.x, panel.y, panel.w, panel.h, mx, my))		
					for (var i = 0; i < panel.bindings.length; i++) {
						var proxy = panel.bindings[i].proxy;
						proxy.focus = hittestrect(proxy.x, proxy.y, proxy.w, proxy.h, mx, my);
					}	

			}

			for (var i = 0; i < panel.bindings.length; i++) {
				var proxy = panel.bindings[i].proxy;
				if(typeof proxy.interaction !== "undefined" && this.isFunction(proxy.interaction))
					proxy.interaction(this,keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove);
			}		
		}
		function FadeIn()
		{
			this.visibility = true;
		}
		function FadeOut()
		{
			this.visibility = false;
		}
		function getControl(trs, name, text)
		{
			for (var i = 0; i < this.bindings.length; i++) {
				if(this.bindings[i].refName === name)
					return this.bindings[i].proxy;
			};
			return null;
		}
		function addTextBox(trs, name, label, text, ismultiline, acceptedOrDeclined, relativity)
		{
			var textbox = trs.AddTextBox(label, text, ismultiline, acceptedOrDeclined);
			var incapsulated = {refName: name, relative: relativity, proxy: textbox};
			this.bindings.push(incapsulated);
			updateRelativitys(trs, this);
			return incapsulated;
		}
		function addButton(trs, name, caption, callback, font, fontheight, relativity)
		{
			var button = trs.addButton(name, caption, font, fontheight, callback);
			var incapsulated = {refName: name, relative: relativity, proxy: button};
			this.bindings.push(incapsulated);
			updateRelativitys(trs, this);
			return incapsulated;
		}
		function showProxyPanel(x,y,w,h)
		{
			// set childs visibility: 1
			// update relativitys
			x = this.bounds.width - w - 4; 
			this.proxyPanel.activepanel.x = x;
			this.proxyPanel.activepanel.y = y;
			this.proxyPanel.activepanel.w = w;
			this.proxyPanel.activepanel.h = h;

			updateRelativitys(this, this.proxyPanel.activepanel);
			return this.proxyPanel.activepanel;
		}
		function updateRelativitys(trs, panel)
		{
			for (var i = 0; i < panel.bindings.length; i++) {
				var proxy = panel.bindings[i].proxy;
				var rules = panel.bindings[i].relative;
				proxy.x = updateProxyByRules(panel, rules.x, rules.xrule);
				proxy.y = updateProxyByRules(panel, rules.y, rules.yrule);

				proxy.w = (rules.rrule==="abs" ? rules.right : updateProxyByRules(panel, rules.right, rules.rrule)-proxy.x);
				proxy.h = (rules.brule==="abs" ? rules.bottom : updateProxyByRules(panel, rules.bottom, rules.brule)-proxy.y);
			};
		}
		function updateProxyByRules(panel, val, rule)
		{
			switch(rule)
			{
				case "left":
					return panel.x + val; 
				break;
				case "top":
					return panel.y + val; 
				break;
				case "right":
					return panel.x + panel.w + val; 
				break;
				case "bottom":
					return panel.y + panel.h + val; 
				break;
				case "absx":
					return proxy.x + val; 
				break;

				default:
					throw "unexpected relative rule for child control: "+ rule
				break;
			}
		}
		function RenderProxyPanels()
		{
			var panel = this.proxyPanel.activepanel;
			if(panel.visibility){
				this.context.fillStyle = "rgba(37, 51, 62, .8)";
				this.context.fillRect(panel.x, panel.y, panel.w, panel.h);

				for (var i = 0; i < panel.bindings.length; i++) {
					var proxy = panel.bindings[i].proxy;
					if(typeof proxy.render !== "undefined" && this.isFunction(proxy.render))
						proxy.render(this);
				}
			}
		}
		// all refrence objects, but interaction is function
		function addBinding(refControlName, positionAndSize, relativePos, visibility, interaction, focus)
		{
			var ap = this.proxyPanel.activepanel;
			ap.bindings.push({refName: refControlName, positionAndSize: positionAndSize, 
				relativePos: relativePos, visibility: visibility,
				interaction: interaction, focus: focus});
		}
		function hittestrect(x,y,w,h,hitX,hitY) {
			return(x<hitX&&x+w>=hitX&&y<hitY&&y+h>=hitY);
		}
		truss_o.extendModule(vPanel, "view.ProxyPanel", ["view.Interface", "core.runtime", "view.Button", "view.TextBox"]);
}());// "runtime.js"

(function(){
	//"use strict";
	function cView(trs){
		trs.runtime={};
	}
	truss_o.extendModule(cView, "core.runtime");
}());// "shortcuts.js"
// "structure.js"

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
			var pp = trs.showProxyPanel(25,60,164,212);
			//f25b waterdrop
			//f12e doc text
			//f120 - ok
			//f128 - cancel
			trs.loadFont("Ionicons", ["/content/fonts/ionicons.woff?v=1.3.5", "fonts/ionicons.woff?v=1.3.5"]);
			pp.addButton(trs, "test", "\uf12e", null, "12px Ionicons", 12,
				{x:-14, y: 2, right: 0, bottom: 14, xrule: 'left', yrule: 'top', rrule: 'left', brule: 'abs'});
			pp.addButton(trs, "test2", "\uf25b", null, "12px Ionicons", 12,
				{x:-14, y: 2+14 +2, right: 0, bottom: 14, xrule: 'left', yrule: 'top', rrule: 'left', brule: 'abs'});
			pp.addTextBox(trs, "label", "left caption", "text", false, null, 
				{x: 8, y: 22, right: -2, bottom: 14, xrule: 'left', yrule: 'top', rrule: 'right', brule: 'abs'});
			
			pp.addTextBox(trs, "label2", "right text", "text2", true, null, 
				{x: 8, y: 22+16+22, right: -2, bottom: 120, xrule: 'left', yrule: 'top', rrule: 'right', brule: 'abs'});
			
			var btnOk = pp.addButton(trs, "bok", "\uf120", null, "18px Ionicons", 20,
				{x: 8, y: 22+16+22+120+4, right: 24, bottom: 24, xrule: 'left', yrule: 'top', rrule: 'abs', brule: 'abs'});
			var btnCancel = pp.addButton(trs, "bc", "\uf128", null, "18px Ionicons", 20,
				{x: 8+24+4, y: 22+16+22+120+4, right: 24, bottom: 24, xrule: 'left', yrule: 'top', rrule: 'abs', brule: 'abs'});
			btnOk.proxy.hovercolor = "rgb(40, 255, 187)";
			btnCancel.proxy.hovercolor = "rgb(255, 40, 187)";
			btnOk.proxy.drawbackground = false;
			btnCancel.proxy.drawbackground = false;

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
		var txt2= trs.objects[trs.editTextNode].labelRight;

		trs.EditPanel.getControl(trs, "label").setText(txt||"");
		trs.EditPanel.getControl(trs, "label2").setText(txt2||"");
		trs.EditPanel.getControl(trs, "bok").callback = function(){editAccepted.call(trs, "OK");}
		trs.EditPanel.getControl(trs, "bc").callback = function(){editAccepted.call(trs, "Cancel");}
		trs.EditPanel.Show();
		// trs.TextBoxShow("right", 250, "left Caption", txt, false, editAccepted);
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
			this.objects[this.editTextNode].label = this.EditPanel.getControl(this, "label").getText();
			this.objects[this.editTextNode].labelRight = this.EditPanel.getControl(this, "label2").getText();
			this.PushEvent("nodeEditAccept", [this.editTextNode, this.objects[this.editTextNode].label, this.objects[this.editTextNode].labelRight]);
			// this.TextBoxHide();
			this.EditPanel.Hide();
			this.editTextNode = -1;
		}else{
			this.PushEvent("nodeEditDecline", this.editTextNode);
			// this.TextBoxHide();
			this.EditPanel.Hide();
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

			this.ProxyPanelInteractionEntry(null,null, e,null,null);

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
}());// "textbox.js"
(function(){

	function cTextBox(trs){
		trs.TextBox = { x: 0, y: 0, width: 128, height: 14, isOnDisplay: false, activeBox:
		 {
		 	multiline: false, label: "nolabel",
		 	caretOnDisplay: 0.1, caretOnDisplayAlphaIncStep: 3*1.0/30, caretSETupDownX: 0, caretPositionX: 0,
		 	state: {isDragging: false, selection: {left: 0, right: 0}}, measured: false, caretLine: 0, caretIndex: 0,
		 	text: "first line", lines: 
		 	[{t: "first line", w: 0, davw: 0, y: 0}, {t: "second line", w: 0, davw: 0, y: 0}, 
		 	{t: "x", w: 0, davw: 0, y: 0}, {t: "xu", w: 0, davw: 0, y: 0}
		 	], 
		 	fadeIn: 1, fadeOut: false
		  },
		  textboxes: [
		  ]
		};

		trs.AddTextBox = AddTextBox;
		// trs.TextBoxShow = showTextBox;
		// trs.TextBoxHide = hideTextBox;
		// trs.TextBoxTextGet = GetText;
		trs.TextBoxInteractionInput = interactionInput;
		trs.TextBoxGetSelectedText = getSelectedText;

		// trs.TextBoxRender = drawTextBox;
		trs.CreateTimer(1000/30, shHideCaretAndFade);
	}
	function renderTextBox(trs)
	{
		trs.SetShadow();
		if(!this.measured)
			drawTextBoxText(trs, this, true);
		drawTextBoxBackground(trs, this);
		drawTextBoxText(trs, this, false);
	}
	function AddTextBox(label, text, ismultiline, acceptedOrDeclined)
	{
		var textbox = {
				x:0, y: 0, w: 0, h: 0, 
				visible: 1, interaction: interactionInput, focus: false,
				fonth: 13,
				scrollx: 0, scrolly: 0, scrollchunkyh: 0, scrollchunkxw: 0, scrollchunkyy: 0, scrollchunkxx: 0,
				textwidth: 0, textheight: 0,
				render: renderTextBox, setText: setText, getText: getText,
				// caption: caption, font: font, fontheight: fontheight, callback: callback,
				
				caretSETupDownX: 0, caretPositionX: 0, caretPositionY: 0, 
		 		state: {isDragging: false, selection: {left: 0, right: 0}}, measured: false, caretLine: 0, caretIndex: -1,
		 		label: label, multiline: ismultiline, 
		 		text: "first line", lines: [{t: text, w: 0, davw: 0, y: 0}]
			};
		// hitCursorToCaret(this, textbox, 0, 0, 0);
		this.TextBox.textboxes.push(textbox);
		return textbox;
	}
				
	function GetText()
	{
		var result = "";
		for (var i = 0; i < this.TextBox.activeBox.lines.length; i++) {
			result += this.TextBox.activeBox.lines[i].t;
		};
		return result;
	}

	function setText(text)
	{
		this.lines.length = 1;
		this.lines[0] = {t: text, w: 0, davw: 0, y: 0};
		this.measured = false;
		this.scrollx = this.scrolly = this.caretIndex = this.caretLine = 0;
		this.text = text;
	}
	function getText()
	{
		var result = "";
		for (var i = 0; i < this.lines.length; i++) {
			result += this.lines[i].t;
		};
		return result;
	}
	function shHideCaretAndFade()
	{
		// if(this.TextBox.isOnDisplay || this.TextBox.activeBox.fadeOut)
		{
			var mod =3*1.0/(30/(60/(this.fps.rate>60?60:this.fps.rate)));

			this.TextBox.activeBox.caretOnDisplay += this.TextBox.activeBox.caretOnDisplayAlphaIncStep * mod;
			if(this.TextBox.activeBox.caretOnDisplay < 0 || this.TextBox.activeBox.caretOnDisplay >= 1)
			{
				
				// var mod =3*1.0/(30/(60/(this.fps.rate>60?60:this.fps.rate)));
				if(this.TextBox.activeBox.caretOnDisplay < 0)
					this.TextBox.activeBox.caretOnDisplayAlphaIncStep = 1;//mod;
				else this.TextBox.activeBox.caretOnDisplayAlphaIncStep = -1;//mod * -1;

			}
			// if(!this.TextBox.activeBox.fadeOut && this.TextBox.activeBox.fadeIn < 1.0)
			// {
			// 	this.TextBox.activeBox.fadeIn +=0.25;
			// }else
			// if(this.TextBox.activeBox.fadeOut && this.TextBox.activeBox.fadeIn > 0.0)
			// {
			// 	this.TextBox.activeBox.fadeIn -=0.25;
			// }
			// if(this.TextBox.activeBox.fadeOut && this.TextBox.activeBox.fadeIn <=0)
			// 	this.TextBox.activeBox.fadeOut = false;

			this.update();	
		}
	}
	var ignoreCodes = [95,93,125,123,91,160,171,92,8230,187];
	function interactionInput(trs,keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove)
	{
		// if(!this.TextBox.isOnDisplay)
		// 	return;
		//var acb = this.TextBox.activeBox;
		if(mouseMove !== null)
		{
			var e = mouseMove;
			var mx = trs.runtime.mx;
			var my = trs.runtime.my;
			var hit = false;
			for (var i = 0; i < this.lines.length; i++) {
				if(hittestrect(this.x-4, this.lines[i].y, this.w, this.h, mx, my))
				{ 
					hit = true;
					break;
				}
				if(!this.multiline)
					break;
			};
			if(hit)
			{
				trs.setCursor("text")
			}
		}else if (this.focus)
			{
				if(mouseUp !== null && mouseUp.which === 1)
				{
					var e = mouseUp;
					var mx = trs.runtime.mx + this.scrollx;
					var my = trs.runtime.my + this.scrolly;
					// set caret position
					// assume drag over point

					setTextParams(trs)
					for (var i = 0; i < this.lines.length; i++) {
						if(hittestrect(this.x-4, this.lines[i].y, this.w, 12, mx, my))
						{ 
							hitCursorToCaret(trs, this, i, mx-this.x);
							this.caretSETupDownX = this.caretPositionX;
						}
						if(!this.multiline)
							break;
					};

				}else if(keyboardDownEvent !== null){
					var e = keyboardDownEvent;
					if(e.keyCode === 8)// backspace
					{ 
						var str = this.lines[this.caretLine].t;

						if(this.caretIndex == -1)
						{
							if(this.caretLine > 0 && this.multiline)
							{
								var cp  = this.lines[this.caretLine - 1].t.length-1;
								this.lines[this.caretLine - 1].t = this.lines[this.caretLine - 1].t + str;
								this.caretLine--; 
								this.caretPositionY = this.lines[this.caretLine].y;
								this.caretSETupDownX = this.caretPositionX = this.lines[this.caretLine].w;	
								this.caretIndex=cp;
								this.lines.splice(this.caretLine+1, 1);

								scrolltoCaret(trs, this)

								this.measured = false;
							}
						}else{
							var newleft = str.substr(0, this.caretIndex);
							setTextParams(trs)
							var dim = trs.context.measureText(newleft);
							this.lines[this.caretLine].t =  newleft + str.substr(this.caretIndex+1, str.length - this.caretIndex-1);
							this.caretIndex--;
							this.caretSETupDownX = this.caretPositionX = dim.width;
							this.measured = false;
							scrolltoCaret(trs, this)
						}
					}else if(e.keyCode === 37)// left arrow
					{
						if(e.ctrlKey)
						{
							var letterscoped = false;
							var ctrace = this.caretIndex;
							while(ctrace >= 0)
							{
								var chc = this.lines[this.caretLine].t.charCodeAt(ctrace);
		       					if(ignoreCodes.indexOf(chc) >= 0 || (chc <=64 && chc >= 0))
		       					{
		       						if(letterscoped){
			       						this.caretIndex = ctrace; 
			       						break;
			       					}
		       					}else{
		       						if(!letterscoped)
		       							letterscoped = true;
		       					}
								ctrace--;
							}
							if(ctrace === -1 && letterscoped)
								this.caretIndex = -1;
						}else{
							this.caretIndex--;
						}
						if(this.caretIndex < -1)//clip
							this.caretIndex = -1;
						setTextParams(trs);
						var dim = trs.context.measureText(this.lines[this.caretLine].t.substr(0, this.caretIndex+1));
						this.caretSETupDownX = this.caretPositionX = dim.width;
						scrolltoCaret(trs, this);

					}else if(e.keyCode === 39)// right arrow
					{
						if(e.ctrlKey)
						{
							var letterscoped = false;
							var nextword = false;
							var ctrace = this.caretIndex;
							var tl = this.lines[this.caretLine].t.length;
							while(ctrace < tl)
							{
								var chc = this.lines[this.caretLine].t.charCodeAt(ctrace);
		       					if(ignoreCodes.indexOf(chc) >= 0 || (chc <=64 && chc >= 0))
		       					{
		       						if(letterscoped)
		       							nextword = true;
		 
		       					}else{
		       						if(!letterscoped)
		       							letterscoped = true;
		       						else if(nextword)
		       						{
			       						this.caretIndex = ctrace-1; 
			       						break;
		       						}
		       					}
								ctrace++;
							}
							if(ctrace === tl && letterscoped)
								this.caretIndex = tl - 1;
						}else{
							this.caretIndex++;
						}

						if(this.caretIndex > this.lines[this.caretLine].t.length)//clip
							this.caretIndex = this.lines[this.caretLine].t.length - 1;
						setTextParams(trs);
						var dim = trs.context.measureText(this.lines[this.caretLine].t.substr(0, this.caretIndex+1));
						this.caretSETupDownX = this.caretPositionX = dim.width;
						scrolltoCaret(trs, this);

					}else if(e.keyCode === 40)// down arrow
					{
						if(this.multiline)
						{
							this.caretLine++;
							if(this.caretLine >= this.lines.length)
								this.caretLine = this.lines.length - 1;

							hitCursorToCaret(trs, this, this.caretLine, this.caretSETupDownX);
							scrolltoCaret(trs, this);

						}
					}else if(e.keyCode === 38)// up arrow
					{
						if(this.multiline)
						{
							this.caretLine--;
							if(this.caretLine < 0)
								this.caretLine = 0;
							hitCursorToCaret(trs, this, this.caretLine, this.caretSETupDownX);
							scrolltoCaret(trs, this);

						}
					}else if(e.keyCode === 46)// del/delete
					{
						var str = this.lines[this.caretLine].t;
						if(str.length >= this.caretIndex+2)
						{
							var newleft = str.substr(0, this.caretIndex+1);

							this.lines[this.caretLine].t =  newleft + str.substr(this.caretIndex+2, str.length - this.caretIndex-1);
							this.measured = false;
						}

					}else if(e.keyCode == 27)
					{
						if(typeof this.acceptedOrDeclined !== "undefined" && trs.isFunction(this.acceptedOrDeclined))
							this.acceptedOrDeclined.call(trs, "ESCAPE");
					}
					else if(e.keyCode === 13)// enter
					{
						// todo: accept input changes
						if(this.multiline)
						{
							var str = this.lines[this.caretLine].t;
							this.caretLine++;
							if(this.caretLine > this.lines.length)
								throw '';
							var nly = (this.caretLine === 0 ? this.fonth: this.lines[this.caretLine-1].y+this.fonth);
							if(this.caretLine === this.lines.length)
								this.lines.push({t: "xu", w: 0, davw: 0, y: nly});
							else this.lines.splice(this.caretLine, 0, {t: "xu", w: 0, davw: 0, y: nly});

							this.lines[this.caretLine-1].t = str.substr(0, this.caretIndex+1);
							this.lines[this.caretLine].t = str.substr(this.caretIndex+1, str.length-this.caretIndex-1);
							this.caretIndex = -1;
							this.caretPositionY = this.lines[this.caretLine-1].y+this.fonth;
							this.caretSETupDownX = this.caretPositionX = 0;
							this.measured = false;

							this.textheight = nly - this.y;
							scrolltoCaret(trs, this);
						}else{
							if(typeof this.acceptedOrDeclined !== "undefined" && trs.isFunction(this.acceptedOrDeclined))
								this.acceptedOrDeclined.call(trs, "OK");
						}
					}else{
						// input
				        var key = e.keyCode || e.which; // alternative to ternary - if there is no keyCode, use which
			      		var keychar = String.fromCharCode(key);

			      		var str = this.lines[this.caretLine].t;
			      		setTextParams(trs)
			      		var dim = null;
			      		if(this.caretIndex>=0)
			      		{
				      		var left = str.substr(0, this.caretIndex+1);
							this.lines[this.caretLine].t = left+keychar+str.substr(this.caretIndex+1, str.length-this.caretIndex-1);
							dim = trs.context.measureText(left+keychar);
						}else{
							this.lines[this.caretLine].t = keychar+str;
							dim = trs.context.measureText(keychar);
						}

						this.caretSETupDownX = this.caretPositionX = dim.width;
						this.measured = false;
						this.caretIndex++;
						scrolltoCaret(trs, this);
						// console.log(keychar)
					}
				}
		}
	}
	function hitCursorToCaret(trs, textbox, lineIndex, x)
	{
		// var acb = trs.TextBox.activeBox;

		var avgindex = -1;
		if(textbox.lines[lineIndex].t.length > 0)
		{
			avgindex = Math.floor((x) / textbox.lines[lineIndex].davw)-1;
			if(avgindex < -1)
				avgindex = -1;
			
			setTextParams(trs);
			
			var tl = textbox.lines[lineIndex].t.length;
			var dim = trs.context.measureText(textbox.lines[lineIndex].t.substr(0,avgindex+1));

			if(avgindex >= tl)
			{	
				avgindex = tl-1;

			}else{

				while((dim.width < x) && avgindex >= 0 && avgindex < tl)
				{
					avgindex ++;
					dim = trs.context.measureText(textbox.lines[lineIndex].t.substr(0,avgindex+1));
				}
				var delta1 = dim.width - x;
				var dim2 = trs.context.measureText(textbox.lines[lineIndex].t.substr(0,avgindex));
				//var delta2 = Math.abs(dim.width + textbox.x - x);
				if(delta1 > 3)
				{	
					avgindex--;
					dim = dim2;
				}
				if(avgindex >= tl)
				{	
					avgindex = tl-1;
					dim = trs.context.measureText(textbox.lines[lineIndex].t.substr(0,avgindex+1));
				}
			}

			textbox.caretPositionX = dim.width;
		}else
		{
			textbox.caretPositionX = 0;
		}
		textbox.caretPositionY = 0;
		textbox.caretIndex = avgindex;
		textbox.caretLine = lineIndex;
	}
	function scrolltoCaret(trs, textbox)
	{
		var carety = textbox.lines[textbox.caretLine].y - textbox.y ;
		var caretx = textbox.caretPositionX;// - textbox.x;

		if(caretx - textbox.scrollx  >= textbox.w)
		{
			textbox.scrollx = caretx - textbox.w + 44;

			textbox.measured = false;
		}else if(caretx - textbox.scrollx <= 0){
			textbox.scrollx = caretx-44;
			if(textbox.scrollx < 0)
				textbox.scrollx = 0;
			textbox.measured = false;
		}

		if(carety - textbox.scrolly+ textbox.fonth >= textbox.h)
		{
			textbox.scrolly = carety - textbox.h + 44;

			textbox.measured = false;
		}else if(carety - textbox.scrolly <= 0){
			textbox.scrolly = carety-44;
			if(textbox.scrolly < 0)
				textbox.scrolly = 0;
			textbox.measured = false;
		}

	}
	// function drawTextBox()
	// {
	// 	if(this.TextBox.isOnDisplay || this.TextBox.activeBox.fadeOut)
	// 	{
	// 		this.SetShadow();
	// 		if(!this.TextBox.activeBox.measured)
	// 			drawTextBoxText(this, true);
	// 		drawTextBoxBackground(this);
	// 		drawTextBoxText(this, false);
	// 	}
	// }
	function drawTextBoxBackground(trs, textbox)
	{
		var acb = trs.TextBox.activeBox;
		trs.SetShadow(0,0,4,"rgba(255, 255, 255, "+Math.min(0.5,acb.fadeIn)+")");
		
		//255, 187, 40
		if(textbox.focus)
			trs.context.fillStyle = "rgba(236, 244, 252, "+Math.min(0.9,acb.fadeIn)+")";//"rgba(255, 255, 255, 0.6)";
		else trs.context.fillStyle = "rgba(136, 136, 136, "+Math.min(0.7,acb.fadeIn)+")";
		trs.context.fillRect(textbox.x-4, textbox.y-4, textbox.w+4, textbox.h+4);
		trs.SetShadow();
		trs.context.fillStyle = "rgba(111, 111, 111, "+Math.min(0.4,acb.fadeIn)+")";//"rgba(255, 255, 255, 0.6)";
		trs.context.fillRect(textbox.x-4, textbox.y-(4+12+2), textbox.w+4, 12+2);
		
		setTextParams(trs);
		trs.context.font = "10px Verdana";
		trs.context.fillStyle = "rgba(255, 255, 255, "+acb.fadeIn+")";
		trs.context.fillText(textbox.label+":", textbox.x, textbox.y-4-2);

		// scrollbars:
		trs.context.fillStyle = "rgba(255, 0, 0, "+Math.min(.7,acb.fadeIn)+")";
		if(textbox.multiline)
		{
			if(textbox.scrollchunkyh < textbox.h || textbox.scrolly > 0)
			{
				var hmaxscrl = textbox.h-4;
				trs.context.fillRect(textbox.x+textbox.w-3, textbox.y+textbox.scrollchunkyy, 2, textbox.scrollchunkyh);
			}

		}

		if(textbox.scrollchunkxw < textbox.w || textbox.scrollx > 0)
		{
			trs.context.fillRect(textbox.x+textbox.scrollchunkxx, textbox.y+textbox.h-(textbox.multiline?3:2), textbox.scrollchunkxw, textbox.multiline?2:1);
		}
	}

	function setTextParams(trs)
	{
		trs.SetShadow();
		trs.context.font = "13px Verdana";
		trs.context.textBaseline = "bottom";// "top";
		trs.context.textAlign = 'start';
		trs.context.fillStyle = "rgba(0, 0, 0, "+trs.TextBox.activeBox.fadeIn+")";//"rgb(0, 0, 0)";
	}
	function drawTextBoxText(trs, textbox, measureOnly)
	{
		setTextParams(trs)
		// ---
		var textwidth = 0, textheight = 0;
		if(measureOnly)
		{
			
	    }else{
	    	trs.context.save();
	    	trs.context.beginPath();
			trs.context.rect(textbox.x, textbox.y-4, textbox.w, textbox.h+4);
	        trs.context.clip();
	        // scroll here:
	        trs.context.translate(-textbox.scrollx, -textbox.scrolly);
	    }

		for (var i = 0; i < textbox.lines.length; i++) {

			if(measureOnly)
			{
				var dim = trs.context.measureText(textbox.lines[i].t);
				textbox.lines[i].w = dim.width;
				
				textwidth = Math.max(textwidth, dim.width);

				textbox.lines[i].davw = dim.width / textbox.lines[i].t.length;
				textbox.lines[i].y = textbox.y + (i*textbox.fonth);

				textheight = textbox.lines[i].y - textbox.y;
			}
			else
			{		
				trs.context.fillText(textbox.lines[i].t, textbox.x, textbox.lines[i].y+textbox.fonth);
			}
			if(!textbox.multiline)
				break;
		};
		if(measureOnly)
		{
			textbox.textwidth = textwidth;
			textbox.textheight = textheight;
			//                        aspect                   scroll area
			var overheadh = textbox.h+textbox.scrolly-	textheight;
			overheadh = overheadh > 0? overheadh:0;
			textbox.scrollchunkyh = (textbox.h / (textheight+overheadh)) * textbox.h;
			textbox.scrollchunkyy =  (textbox.h / (textheight+overheadh)) * textbox.scrolly;
			//
			var overhead = textbox.w+textbox.scrollx-	textwidth;
			overhead = overhead > 0? overhead:0;
			textbox.scrollchunkxw = (textbox.w / (textwidth+overhead)) * textbox.w;
			textbox.scrollchunkxx =  (textbox.w / (textwidth+overhead)) * textbox.scrollx;

			//
			textbox.measured = true;
			return;
		}else{

			// --- caret
			if(textbox.focus)
			{
				trs.context.strokeStyle = "rgba(0, 0, 0, "+Math.min(trs.TextBox.activeBox.caretOnDisplay, trs.TextBox.activeBox.fadeIn)+")";
				trs.context.beginPath();
				trs.context.lineWidth = 1;
				trs.context.moveTo(textbox.caretPositionX + textbox.x +.5, textbox.lines[textbox.caretLine].y + -2+1);
				trs.context.lineTo(textbox.caretPositionX + textbox.x +.5, textbox.lines[textbox.caretLine].y + 2+10);
				trs.context.closePath();
		    	trs.context.stroke();
		    }
	    	trs.context.restore();
		}
	}
	// function showTextBox(x, y, label, text, ismultiline, acceptedOrDeclined)
	// {
	// 	if(x === "right")
	// 	{
	// 		x = this.bounds.width - this.TextBox.width - 4; 
	// 	}
	// 	this.TextBox.x = x;
	// 	this.TextBox.y = y;

	// 	this.TextBox.activeBox.acceptedOrDeclined = acceptedOrDeclined;
	// 	this.TextBox.activeBox.label = label;
	// 	this.TextBox.activeBox.text = text;
	// 	this.TextBox.activeBox.lines = [{t: text, w: 0, davw: 0, y: y}];
	// 	hitCursorToCaret(this, 0, x+1,y+1)
	// 	this.TextBox.activeBox.fadeIn = 0;
	// 	this.TextBox.activeBox.measured = false;
	// 	this.TextBox.isOnDisplay = true;

	// 	this.update();	
	// }
	function hideTextBox()
	{
		this.TextBox.isOnDisplay = false;
		this.TextBox.activeBox.fadeOut = true;
		this.update();	
	}
	function resizeTextBox(width, height)
	{

	}
	function getSelectedText()
	{

	}
	function hittestrect(x,y,w,h,hitX,hitY) {
		return(x<hitX&&x+w>=hitX&&y<hitY&&y+h>=hitY);
	}

	truss_o.extendModule(cTextBox, "view.TextBox", ["view.Interface", "core.Animate"]);
}());// "timeline.js"
// "view.js"

(function () {
    //"use strict";
    function cView(trs) {
        //
        updateBounds(trs);
        trs.updateBounds = function () { updateBounds(trs); }
        //
        trs.ViewEngines = [];
        // trs.CViewEnginesName = [];
        // trs.CViewEngines = [];
        trs.ActiveEngine = null;
        
        trs.addViewEngine = addEngine;
        trs.setViewEngine = setCurrentEngine;
        trs.FindViewEngine = FindEngine;
        trs.Clear = Clear;
        trs.ClearRect = ClearRect;
        trs.GetCanvasData = GetCanvasData;
        trs.PutCanvasData = PutCanvasData;
        trs.PutCanvasDataPart = PutCanvasDataPart;
        trs.SetShadow = Shadow;
        trs.drawArrow = drawArrow;

        trs.cursorStyle = "reset";
        trs.lastCursorSet = "default";
        trs.setCursor = setCursor;
        trs.acceptSetCursor = acceptSetCursor;

        trs.addEventCallback("NodeAdded", NodeAdded);
        trs.addEventCallback("NodesSeparated", NodesSeparated);
        trs.addEventCallback("NodeRemoved", NodeRemoved);
        trs.addEventCallback("Render", Render);
        trs.addEventCallback("update", update);
    }
    function setCursor(style){
        if(this.cursorStyle !== style)
            this.cursorStyle = style;
    }
    function acceptSetCursor(up){
        if(up)
            this.cursorStyle = "reset";
        else if(this.cursorStyle!=="reset" && this.lastCursorSet != this.cursorStyle)
            this.canvas.style.cursor = this.lastCursorSet = this.cursorStyle;
    }
    function updateBounds(trs) {
        trs.bounds = {
            width: trs.canvas.width, height: trs.canvas.height,
            //left: $(trs.canvas).position().left, top: $(trs.canvas).position().top
		left : trs.canvas.offsetLeft, top: trs.canvas.offsetTop
        };
    }
    function addEngine(name, iface) {
        var eng = this.FindViewEngine(name);
        if (eng < 0)
        { this.ViewEngines.push({ name: name, iface: iface }); }
        else { throw 'the view engine ' + name + ' already registered'; }
    }
    function setCurrentEngine(name) {
        var eng = this.FindViewEngine(name);
        if (eng < 0)
            throw 'the view interface ' + name + ' not found';
        // if (this.CViewEnginesName.indexOf(this.ViewEngines[eng].name) < 0) {
        //     this.CViewEnginesName.push(this.ViewEngines[eng].name);
        //     this.CViewEngines.push(this.ViewEngines[eng].iface);
        // } else {
        //     throw 'the view interface ' + name + ' already enabled';
        // }
        this.ActiveEngine = this.ViewEngines[eng];
    }
    function FindEngine(name) {
        for (var i = 0; i < this.ViewEngines.length; i++) {
            if (this.ViewEngines[i].name === name)
                return i;
        };
        return -1;
    }
    function Clear() {
        this.context.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }
    function ClearRect(rect) {
        this.context.clearRect(rect.x, rect.y, rect.width, rect.height);
    }
    function GetCanvasData() {
        //this.context.save();
        var imageData = this.canvas;//this.context.getImageData(0, 0, this.bounds.width, this.bounds.height)
        //this.context.restore();
        //var image = new Image();
        //var imageData = this.context.getImageData(0, 0, this.bounds.width, this.bounds.height);

        return imageData;
    }
    function PutCanvasData(imageData) {
        //this.context.putImageData(imageData,0,0);
        this.context.drawImage(imageData, 0, 0);
    }
    function PutCanvasDataPart(imageData, x, y, dx, dy, dw, dh) {
        this.context.drawImage(imageData, x, y, dx, dy, dw, dh);
    }
    function NodeAdded(name, index) {
        this.update();
    }
    function NodesSeparated(indexa, indexb) {
        this.update();
    }
    function NodeRemoved(obj, index) {
        this.update();
    }
    function ViewProc(trs, foo) {
        // var iface;
        // for (var i = 0; i < trs.CViewEngines.length; i++) {
        //     iface = trs.CViewEngines[i];
        //     if (typeof iface === "undefined")
        //     { continue; }

        //     iface[foo].call(trs);
        // }
        if(trs.ActiveEngine !== null)
            trs.ActiveEngine.iface[foo].call(trs);
    }
    function Shadow(offsetX, offsetY, blur, color) {
        if (typeof offsetX === "undefined") {
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;
            this.context.shadowBlur = 0;
            //this.context.shadowColor = 0;
        } else {
            this.context.shadowOffsetX = offsetX;
            this.context.shadowOffsetY = offsetY;
            this.context.shadowBlur = blur;
            this.context.shadowColor = color;//"rgba(0, 0, 0, 0.6)"; 
        }
    }
    function update() {
        ViewProc(this, 'update');
    }
    function Render() {
        ViewProc(this, 'Render');
    }
    function drawArrow(x1, y1, x2, y2, style, which, angle, d) {
        'use strict';
        style = typeof (style) != 'undefined' ? style : 3;
        which = typeof (which) != 'undefined' ? which : 1; // end point gets arrow
        angle = typeof (angle) != 'undefined' ? angle : Math.PI / 8;
        d = typeof (d) != 'undefined' ? d : 10;
        // default to using drawHead to draw the head, but if the style
        // argument is a function, use it instead
        var toDrawHead = typeof (style) != 'function' ? drawHead : style;

        // For ends with arrow we actually want to stop before we get to the arrow
        // so that wide lines won't put a flat end on the arrow.
        //
        var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var ratio = (dist - d / 3) / dist;
        var tox, toy, fromx, fromy;
        if (which & 1) {
            tox = x1 + (x2 - x1) * ratio;
            toy = y1 + (y2 - y1) * ratio;
        } else {
            tox = x2;
            toy = y2;
        }
        if (which & 2) {
            fromx = x1 + (x2 - x1) * (1 - ratio);
            fromy = y1 + (y2 - y1) * (1 - ratio);
        } else {
            fromx = x1;
            fromy = y1;
        }

        // Draw the shaft of the arrow
        this.context.beginPath();
        this.context.moveTo(fromx, fromy);
        this.context.lineTo(tox, toy);
        this.context.stroke();

        // calculate the angle of the line
        var lineangle = Math.atan2(y2 - y1, x2 - x1);
        // h is the line length of a side of the arrow head
        var h = Math.abs(d / Math.cos(angle));

        if (which & 1) {	// handle far end arrow head
            var angle1 = lineangle + Math.PI + angle;
            var topx = x2 + Math.cos(angle1) * h;
            var topy = y2 + Math.sin(angle1) * h;
            var angle2 = lineangle + Math.PI - angle;
            var botx = x2 + Math.cos(angle2) * h;
            var boty = y2 + Math.sin(angle2) * h;
            toDrawHead(this.context, topx, topy, x2, y2, botx, boty, style);
        }
        if (which & 2) { // handle near end arrow head
            var angle1 = lineangle + angle;
            var topx = x1 + Math.cos(angle1) * h;
            var topy = y1 + Math.sin(angle1) * h;
            var angle2 = lineangle - angle;
            var botx = x1 + Math.cos(angle2) * h;
            var boty = y1 + Math.sin(angle2) * h;
            toDrawHead(this.context, topx, topy, x1, y1, botx, boty, style);
        }
    }
    function drawHead(ctx, x0, y0, x1, y1, x2, y2, style) {
        'use strict';
        // all cases do this.
        //ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        switch (style) {
            case 0:
                // curved filled, add the bottom as an arcTo curve and fill
                var backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                ctx.arcTo(x1, y1, x0, y0, .55 * backdist);
                ctx.fill();
                break;
            case 1:
                // straight filled, add the bottom as a line and fill.
                ctx.lineTo(x0, y0);
                ctx.fill();
                break;
            case 2:
                // unfilled head, just stroke.
                ctx.stroke();
                break;
            case 3:
                //filled head, add the bottom as a quadraticCurveTo curve and fill
                var cpx = (x0 + x1 + x2) / 3;
                var cpy = (y0 + y1 + y2) / 3;
                ctx.quadraticCurveTo(cpx, cpy, x0, y0);
                ctx.fill();
                break;
            case 4:
                //filled head, add the bottom as a bezierCurveTo curve and fill
                var cp1x, cp1y, cp2x, cp2y, backdist;
                var shiftamt = 5;
                if (x2 == x0) {
                    // Avoid a divide by zero if x2==x0
                    backdist = y2 - y0;
                    cp1x = (x1 + x0) / 2;
                    cp2x = (x1 + x0) / 2;
                    cp1y = y1 + backdist / shiftamt;
                    cp2y = y1 - backdist / shiftamt;
                } else {
                    backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                    var xback = (x0 + x2) / 2;
                    var yback = (y0 + y2) / 2;
                    var xmid = (xback + x1) / 2;
                    var ymid = (yback + y1) / 2;

                    var m = (y2 - y0) / (x2 - x0);
                    var dx = (backdist / (2 * Math.sqrt(m * m + 1))) / shiftamt;
                    var dy = m * dx;
                    cp1x = xmid - dx;
                    cp1y = ymid - dy;
                    cp2x = xmid + dx;
                    cp2y = ymid + dy;
                }

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x0, y0);
                ctx.fill();
                break;
        }
        //ctx.restore();
    };
    truss_o.extendModule(cView, "view.Interface", ["core.Events", "core.Animate"]);
}());// "viewdebug.js"

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

		trs.option('view.dbg.backgroundColor1', "rgba(60, 78, 98, 1)");//"rgba(28, 48, 75, 1)");//"rgba(60, 78, 98, 1)");
		trs.option('view.dbg.backgroundColor2', "rgba(35, 47, 59, 1)");//"rgba(11, 20, 31, 1)");//"rgba(35, 47, 59, 1)");

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
		trs.context.strokeRect(trs.aabb.x+.5-2,trs.aabb.y+.5-2,trs.aabb.max_x-trs.aabb.x+2,trs.aabb.max_y-trs.aabb.y+2);
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
			this.drawLayer(backgroundlayer);
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
				
	    		if(this.editTextNode === i)
	    		{
	    			this.context.fillStyle = "rgba(255, 187, 40, 0.8)";
	    			this.context.strokeStyle = "rgb(255, 187, 40)";
	    			//textbox connection
						this.context.beginPath();
				    	this.context.moveTo(this.objects[i].x+0.5, this.objects[i].y+0.5);
						this.context.lineTo(this.EditPanel.x- this.objs_translate.xoffset, this.EditPanel.y- this.objs_translate.yoffset);
				    	this.context.closePath();
				    	this.context.fill();
				    	this.context.stroke();
				    //~
				    this.context.strokeStyle = "#FFFFFF";
	    		}else if(this.selectedNode === i)
	    		{
	    			this.context.fillStyle = "rgba(68, 110, 150, 0.6)";
	    		}
	    		else{
	    			this.context.fillStyle = "rgba(0, 0, 0, 0.2)";
	    		}
	    		
				this.context.beginPath();
		    	this.context.arc(this.objects[i].x, this.objects[i].y, this.options.view.node.radius, 0, 2 * Math.PI, false);
		    	this.context.closePath();
		    	this.context.fill();
		    	this.context.stroke();

		    	this.NodeDisposition(this.objects[i]);

			}
			// if(this.aabb.is_invalidate)
			// 	this.aabb.is_invalidate = false;
			this.context.translate(-this.objs_translate.xoffset,-this.objs_translate.yoffset);


			this.saveLayer();

			this.setLayer();
			this.SetShadow();
			this.drawLayer(nodelayer);
		//}
		// text layer
			//if(!this.runtime.InvalidateTextlayer && this.hasLayerData(textlayer))
			//{
				//this.SetShadow();
				//this.drawLayer(textlayer);
			//} else {
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
		  				this.AABBboundsUpdate(tx, tx+dim.width, ty, ty+12);
		  			}
		  			if(this.objects[i].labelRight !== undefined){
		  				var dim = this.context.measureText(this.objects[i].labelRight);
		  				var tx = this.objects[i].x+this.options.view.node.radius+ 4;
		  				var ty = this.objects[i].y+this.options.view.node.radius*.5;

		  				this.context.fillStyle = "rgba(255, 255, 255, 0.1)";
		  				this.context.fillRect(tx,ty-10,dim.width, 12)

						this.context.fillStyle = "rgb(255, 255, 255)";
		  				this.context.fillText(this.objects[i].labelRight, tx, ty);
		  				this.AABBboundsUpdate(tx, tx + dim.width, ty-10 ,ty + 12);
		  			}
				}
				this.context.translate(-this.objs_translate.xoffset,-this.objs_translate.yoffset);
				// aa bb box
				drawAABB(this);
				this.saveLayer();
			//}
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

			//this.TextBoxRender();
			this.RenderMenu(menulayer, menulayer);
			// ui
			this.RenderProxyPanels();
			//
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
}());// "viewdemo.js"
// "viewinteractive.js"
 
 
