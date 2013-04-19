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
    version:"0.1 devTool",
    options : default_options,
    option : setOption,
    say : sayFunction,
    extendModule : extendFunction,
    create :createFromCanvas,
    isFunction:isFunction,
    uuid:uuid,
    log:log
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
		trs.fps.rate = 0; trs.fps.now = 0; trs.fps.lastUpdate = (new Date)*1 - 1;
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
		var thisFrameFPS = 1000 / ((trs.fps.now=new Date) - trs.fps.lastUpdate);
  			trs.fps.rate += (thisFrameFPS - trs.fps.rate) / fpsFilter;
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
}());// "cmenu.js"
(function(){
	function cMenu(trs){
		trs.menu = { menuList:[], displayMenuName:'', displayMenu:undefined, displayMenuOrigin:{x:0, y:0}, displayMenuBounds:{mwidth:0, h:0}};
		
		trs.RenderDisplayMenuText = function(l,monly){RenderMenuText(this, l, monly);};
		trs.RenderDisplayMenuBackground = function(l){RenderMenuBackground(this, l);};

		trs.AddDisplayMenu = AddMenu;
		trs.ShowMenu = function(name,x,y,monly){ShowMenu(this, name, x, y);};
		trs.HideMenu = HideMenu;
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
		RenderMenuText(this, layerText);
		RenderMenuBackground(this, layerFront);
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
		if(etype=="mouseup" /*|| etype=="keydown"*/)
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
}());// "history.js"
// "image.js"
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

		trs.addEventListener("keydown", onKeyDown);
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
		console.log('pressed '+e.keyCode+', ['+String.fromCharCode(e.keyCode) +']');
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

// "runtime.js"

(function(){
	//"use strict";
	function cView(trs){
		trs.runtime={};
	}
	truss_o.extendModule(cView, "core.runtime");
}());// "sakura_petalis.js"
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
		r.spetalis = { petalis: [], directionVectors: [], wind: {x: 5, y: 5, speed: 0.3}, dt: 0, 
		lastInvDate: new Date(), atlasIds: [], invFooDirection: true };
		
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
		r.spetalis.background.b3 = trs.LoadImage('img/cherry_blossom_way_by_photosynthetique-d15f5nd.jpg');

		prepareVectors(r.spetalis);
		preparePetalis(r.spetalis, trs.bounds);

		trs.CreateTimer(1000/30, petalisIteration);
		trs.CreateTimer(1000/4, petalisIterationW);
		trs.CreateTimer(1000/30, petalisIterationA);

		console.log(r.spetalis);

		trs.AddDisplayMenu("petalisMenu", {items:[
			{text: 'the links below will opened in this tab', callback: null},
			{text:'all coded by cerriun', callback: function(){window.location.href='https://github.com/skipme';}}, 
			{text:'background by photosynthetique.deviantart.com', callback: function(){window.location.href='http://photosynthetique.deviantart.com/art/Cherry-Blossom-Way-69571417';}}, 
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
		for (var i = 0; i < 400; i++) 
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
	}
	function preparePetalis(spetalis,bounds)
	{
		for (var i = 0; i < 900; i++) {
			spetalis.petalis.push(createFolium(spetalis, bounds));
		};
	}
	function createFolium(spetalis, bounds)
	{
		var folium = { dVector: (rnd(0, spetalis.directionVectors.length)-1), windforce: .1, 
			atlas: (rnd(0, spetalis.atlasIds.length)-1), angle: {now: rnd(0,120), isInc: true}, x: rnd(0,bounds.width), y: rnd(0,bounds.height)
			, opacity:rnd(1,20)
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
	}
	
	function foliumIteration(spetalis, folium, dt, bounds)
	{
		var dv = back(dt,1);

		// folium.angle = dv * 120;

		var vec = spetalis.directionVectors[folium.dVector];
		var wind = spetalis.wind;
		folium.x +=(vec.x+spetalis.wind.x)*wind.speed;//+dv*rnd(0,4);
		folium.y +=(vec.y+spetalis.wind.y)*wind.speed;//+dv*rnd(0,4);
		

		if(folium.x > bounds.width)
			folium.x = 0;
		if(folium.y > bounds.height)
			folium.y = 0;

		if(folium.x < 0)
			folium.x = bounds.width;
		if(folium.y < 0)
			folium.y = bounds.height;
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
		for (var i = 0; i < spetalis.petalis.length; i++) {
			var folium = spetalis.petalis[i];

	  		trs.context.globalAlpha = folium.opacity/20;
	  		//trs.DrawAtlas(folium.atlas, folium.x, folium.y, 10, 10);
	  		trs.DrawAtlasAngle(folium.atlas, folium.x, folium.y, 10, 10, folium.angle.now);
		};
		trs.context.globalAlpha = 1;
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
}());// "shortcuts.js"
// "structure.js"

(function(){
	//"use strict";
	function cStructure(trs){
		trs.mouseDragContext = {startX:0,startY:0};
		trs.selectedNode = -1;
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

		//
		trs.DeltasMeasuring = [];

		//trs.addEventListener("click", clicked);
		trs.addEventListener("mousedown", mdown);
		trs.addEventListener("mouseup", mup);
		trs.addEventListener("mousemove", mmove);

		trs.addEvent('MouseDragDelta');
		trs.addEvent('nodeSelected');
		trs.addEvent('nodeFocusLost');

		trs.addEventCallback("Render", Render);
		trs.addDeltaMeasuring = addDeltaMeasuring;

		trs.CreateTimer(30, checkDeltas);
		trs.canvas.oncontextmenu = function() {
			if(typeof trs.menu.displayMenu === 'undefined' && trs.selectedNode>=0)
			{
				trs.ShowMenu("test", trs.objects[trs.selectedNode].x, trs.objects[trs.selectedNode].y);
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

	function clicked(e)
	{
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
			if(this.menu.displayMenu)
			{
				if(this.processInteractionMMdown(e.which, mx, my))
					return;
			}
			var sameSelected = false;

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
			if(selectedN < 0 && !sameSelected)
			{
				this.invokeEvent('nodeFocusLost', [this.selectedNode, -1, this.objects[this.selectedNode]]);
				this.selectedNode = -1
			}

			if(e.which == 1)
			{
				this.HideMenu();
				if(this.selectedNode >= 0)
				{
					this.Dragging = true;
					//console.log("dragging on");
					this.DragList = this.GetRelatedObjectsDeep(this.selectedNode);
					for (var i = 0; i < this.DragList.length; i++) {
						o = this.objects[this.DragList[i]];
						o.targetX = 0;o.targetY = 0; o.dragOn = false;
					};
					this.mouseDragContext.startX = mx - this.objects[this.selectedNode].x - this.objs_translate.xoffset;
					this.mouseDragContext.startY = my - this.objects[this.selectedNode].y - this.objs_translate.yoffset;
					this.objects[this.selectedNode].dragOn = false;
					this.objects[this.selectedNode].targetX = 0;
					this.objects[this.selectedNode].targetY = 0;
					this.objects[this.selectedNode].prevx = this.objects[this.selectedNode].x;
					this.objects[this.selectedNode].prevy = this.objects[this.selectedNode].y;
				}
			
				this.FieldDragging = selectedN == -1;
				if(this.FieldDragging)
				{
					this.FieldDraggingPos.startX = mx;
					this.FieldDraggingPos.startY = my;
					this.FieldDraggingPos.prevX = this.objs_translate.xoffset;
					this.FieldDraggingPos.prevY = this.objs_translate.yoffset;
				}
				this.update();
			} else {
				if(this.selectedNode >= 0)
				{
					this.ShowMenu("node", mx, my);
				}else{
					this.HideMenu();
				}
			}
		}
		this.canvas.focus();
		e.preventDefault()
	}
	function mup(e)
	{
		//console.log("mup");
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
		e.preventDefault();
	}
	function mmove(e)
	{
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
	truss_o.extendModule(cStructure, "view.Structure", ["view.Input", "core.Events", "core.Animate", "objects.Tree", "view.Interface", "view.Menu"]);
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

        trs.addEventCallback("NodeAdded", NodeAdded);
        trs.addEventCallback("NodesSeparated", NodesSeparated);
        trs.addEventCallback("NodeRemoved", NodeRemoved);
        trs.addEventCallback("Render", Render);
        trs.addEventCallback("update", update);
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
            this.context.shadowColor = 0;
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
		trs.CreateTimer(1000/30, flexesIteration);
	}
	function drawFlexes(trs,flexes)
	{
		for (var i = 0; i < flexes.length; i++) {
			f=flexes[i];
			if(!f.visible)
				continue;
			//trs.context.fillStyle = "rgba(255, 255, 255, 0.8)";
			// trs.context.fillStyle = "rgba(255, 255, 255, 0."+f.opacity+")";
			// trs.context.beginPath();
	  //   	trs.context.arc(f.x, f.y, f.szR, 0, 2 * Math.PI, false);
	  //   	trs.context.closePath();
	  //   	trs.context.fill();
	  		// trs.context.globalCompositeOperation = "lighter";
	  		trs.context.globalAlpha = f.opacity/20;
	  		trs.DrawAtlas(f.atlas, f.x, f.y, f.szR, f.szR);
		};
		trs.context.globalAlpha = 1;
	}
	function drawFlexesOvals(trs,flexes)
	{
		//trs.SetShadow(0,0,6,"rgb(255, 255, 255)");
		for (var i = 0; i < flexes.length; i++) {
			f=flexes[i];
			if(!f.visible)
				continue;
			//trs.context.fillStyle = "rgba(255, 255, 255, 0.8)";
			trs.context.fillStyle = "rgba(255, 255, 255, 0."+f.opacity+")";
			trs.context.beginPath();
	    	trs.context.arc(f.x, f.y, f.szR, 0, 2 * Math.PI, false);
	    	trs.context.closePath();
	    	trs.context.fill();
		};
	}
	function flexesIteration()
	{
		var trs = this;
		if(typeof trs.flexes === 'undefined')
		{
			// var imgId = trs.LoadImage('img/snow_flx.pnga_t.png');
			// atlasIds.push(trs.AddAtlas(imgId, 0,0, 22,29));
			// atlasIds.push(trs.AddAtlas(imgId, 23,0, 22,29));
			// atlasIds.push(trs.AddAtlas(imgId, 44,0, 22,29));
			var imgId = trs.LoadImage('img/petalis.png');
			atlasIds.push(trs.AddAtlas(imgId, 11,13, 89,82));
			atlasIds.push(trs.AddAtlas(imgId, 126,13, 79,82));
			atlasIds.push(trs.AddAtlas(imgId, 243,13, 91,104));

			trs.flexes = {layblink:[],lay1:[],lay2:[],lay3:[],lastIteration:new Date(),lastIterationVis:new Date()};
			flexCnt = 190;
			trs.updateBounds();
			
			popFlexes(trs.flexes.lay1, flexCnt, trs.bounds);
			popFlexes(trs.flexes.lay2, flexCnt, trs.bounds);
			popFlexes(trs.flexes.layblink, flexCnt, trs.bounds);
			popFlexes(trs.flexes.lay3, flexCnt, trs.bounds);

			
		}else{
			iterateFlexes(trs.flexes.lay1, trs.bounds);
			iterateFlexes(trs.flexes.lay2, trs.bounds);
			iterateFlexes(trs.flexes.layblink, trs.bounds);
			iterateFlexes(trs.flexes.lay3, trs.bounds);
			if((new Date()) - trs.flexes.lastIterationVis > 1000)
			{
				iterateFlexesVis(trs.flexes.layblink);
				trs.flexes.lastIterationVis=new Date();
			}
			trs.flexes.lastIteration=Date();
			trs.update();
		}
	}
	function iterateFlexes(flexes, bounds)
	{
		for (var i = 0; i < flexes.length; i++) {
			var f=flexes[i];
			f.x+=f.stepx;
			f.y+=f.stepy;
			if(f.x > bounds.width)
				f.x = 0;
			if(f.y > bounds.height)
				f.y = 0;
			if(f.x<0)
				f.x = bounds.width;
			
		};
	}
	function iterateFlexesVis(flexes)
	{
		for (var i = 0; i < flexes.length; i++) {
			f=flexes[i];
			f.visible=rnd(1,20)!=10;
		};
	}
	function popFlexes(flexes, max, bounds)
	{
		for (var i = 0; i < max; i++) {
			var f = {visible:true, szR:rnd(3,12), x:rnd(0,bounds.width),y:rnd(0,bounds.height), 
				stepx:rnd(-1,3), stepy:rnd(1,3), opacity:rnd(1,20),
				atlas: (rnd(0, atlasIds.length) -1)};
			if(f.stepx==0)
				f.stepx=1;
			flexes.push(f);
		};
	}
	function rnd(min,max){
		return min + Math.floor((Math.random()*(max-min)+1));
	}
	function drawAllFlexes(trs){
		if(typeof trs.flexes != 'undefined')
		{
			drawFlexes(trs ,trs.flexes.lay1);
			drawFlexes(trs, trs.flexes.layblink)
			drawFlexes(trs, trs.flexes.lay2);
			drawFlexes(trs, trs.flexes.lay3);
			//trs.blurCanvas();
		}
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
		trs.context.strokeStyle = "#FaFaFa";
		trs.context.strokeRect(trs.aabb.x,trs.aabb.y,trs.aabb.max_x-trs.aabb.x,trs.aabb.max_y-trs.aabb.y);
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

		drawAllFlexes(this);
		
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
                }
                
				this.drawArrow(cx1,cy1,x,y,3,1,Math.PI/4,radius);
			};
  			//this.SetShadow(2,2,6,"rgba(0, 0, 0, 0.8)");
			for (var i = 0; i < this.objects.length; i++) {
				
	    		this.context.lineWidth = .5;
	    		if(this.selectedNode == i)
	    		{
	    			this.context.fillStyle = "rgba(68, 110, 150, 0.6)";
	    		}else{
	    			this.context.fillStyle = "rgba(0, 0, 0, 0.2)";
	    		}
	    		this.context.strokeStyle = "#FFFFFF";
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
				//this.SetShadow(5,5,4,"rgba(0, 0, 0, 0.3)");
				this.context.fillStyle = "rgb(255, 255, 255)";
				for (var i = 0; i < this.objects.length; i++) {
					if(this.objects[i].label != undefined){
						
		  				var dim = this.context.measureText(this.objects[i].label);
		  				var tx = this.objects[i].x-this.options.view.node.radius - dim.width - 4;
		  				var ty = this.objects[i].y+this.options.view.node.radius*.5;

		  				this.context.fillStyle = "rgba(100, 100, 100, 0.5)";
		  				this.context.fillRect(tx,ty-10,dim.width, 12)

		  				this.context.fillStyle = "rgb(255, 255, 255)";
		  				this.context.fillText(this.objects[i].label, tx, ty);
		  			}
		  			if(this.objects[i].labelRight != undefined){

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
}());// "viewdemo.js"
// "viewinteractive.js"
 
 
