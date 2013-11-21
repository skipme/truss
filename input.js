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
}());