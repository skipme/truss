
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
}());