(function(){

	function cTextBox(trs){
		trs.TextBox = { x: 0, y: 0, width: 256, height: 12, isOnDisplay: false, activeBox:
		 {multiline: false,  
		 	caretOnDisplay: 0.1, caretOnDisplayAlphaIncStep: (1.0/(1000/40)), caretPositionX: 0, caretPositionY: 0, 
		 	state: {isDragging: false, selection: {left: 0, right: 0}}, measured: false, caretLine: 0, caretIndex: 0,
		 	text: "first line", lines: [{t: "first line", w: 0, davw: 0, y: 0}, {t: "second line", w: 0, davw: 0, y: 0}, 
		 	{t: "x", w: 0, davw: 0, y: 0}
		 	, {t: "xu", w: 0, davw: 0, y: 0}
		 	] 
		 }
		 };

		trs.TextBoxShow = showTextBox;
		trs.TextBoxHide = hideTextBox;

		trs.TextBoxInteractionInput = interactionInput;
		trs.TextBoxGetSelectedText = getSelectedText;

		trs.TextBoxRender = drawTextBox;
		trs.CreateTimer(1000/30, shHideCaret);
	}
	function shHideCaret()
	{
		if(!this.TextBox.isOnDisplay)
			return;
		// clip

		//this.TextBox.activeBox.caretOnDisplay = !this.TextBox.activeBox.caretOnDisplay;
		this.TextBox.activeBox.caretOnDisplay += this.TextBox.activeBox.caretOnDisplayAlphaIncStep;
		if(this.TextBox.activeBox.caretOnDisplay < 0 || this.TextBox.activeBox.caretOnDisplay > 1)
		{
			this.TextBox.activeBox.caretOnDisplayAlphaIncStep *= -1;
		}
		this.update();	
	}
	function interactionInput(keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove)
	{
		if(!this.TextBox.isOnDisplay)
			return;
		var acb = this.TextBox.activeBox;
		if(mouseUp !== null && mouseUp.which === 1)
		{
			var e = mouseUp;
			var mx = e.pageX-this.bounds.left;
			var my = e.pageY-this.bounds.top;
			// set caret position
			// assume drag over point

			this.context.font = "10pt Verdana";
			this.context.textBaseline ="top";
			this.context.textAlign = 'start';

			for (var i = 0; i < acb.lines.length; i++) {
				if(hittestrect(this.TextBox.x-4, acb.lines[i].y, this.TextBox.width, 12, mx, my))
				{ 
					// acb.lines[i].w
					// this line ...
					// get avg pos
					var avgindex = Math.floor((mx -this.TextBox.x )/ acb.lines[i].davw);
					var dim = this.context.measureText(acb.lines[i].t.substr(0,avgindex));
					var tl = acb.lines[i].t.length;
					while((dim.width + this.TextBox.x < mx) && avgindex >= 0 && avgindex < tl)
					{
						avgindex ++;
						var dim = this.context.measureText(acb.lines[i].t.substr(0,avgindex));
					}

					acb.caretPositionX = dim.width + this.TextBox.x;
					acb.caretPositionY = acb.lines[i].y;
					acb.caretLine = i;
					acb.caretIndex = avgindex;
				}
			};

		}else if(keyboardDownEvent !== null){
			var e = keyboardDownEvent;
			      var key = e.keyCode || e.which; // alternative to ternary - if there is no keyCode, use which
      var keychar = String.fromCharCode(key);
			console.log(keychar)
		}
	}
	function drawTextBox()
	{
		this.SetShadow();
		if(!this.TextBox.activeBox.measured)
			drawTextBoxText(this, true);
		drawTextBoxBackground(this);
		drawTextBoxText(this, false);
	}
	function drawTextBoxBackground(trs)
	{
		trs.context.fillStyle = "rgba(255, 255, 255, 0.6)";
		var acb = trs.TextBox.activeBox;
		trs.SetShadow(0,0,4,"rgba(255, 255, 255, 0.5)");
		trs.context.fillRect(trs.TextBox.x-4, trs.TextBox.y-4, trs.TextBox.width+4, trs.TextBox.height+4);
		trs.SetShadow();
	}
	function drawTextBoxText(trs, measureOnly)
	{
		trs.context.font = "10pt Verdana";
		trs.context.textBaseline ="top";
		trs.context.textAlign = 'start';
		trs.context.fillStyle = "rgb(0, 0, 0)";
		// ---

		var acb = trs.TextBox.activeBox;
		for (var i = 0; i < acb.lines.length; i++) {
			if(measureOnly)
			{
				var dim = trs.context.measureText(acb.lines[i].t);
				acb.lines[i].w = dim.width;
				acb.lines[i].davw = dim.width / acb.lines[i].t.length;
				acb.lines[i].y = trs.TextBox.y + (i*12);
			}
			else
			{		
				trs.context.fillText(acb.lines[i].t, trs.TextBox.x, acb.lines[i].y);
			}
		};
		if(measureOnly)
		{
			trs.TextBox.activeBox.measured = true;
			return;
		}
		// ---
		// var cop = trs.context.globalCompositeOperation;
		// trs.context.globalCompositeOperation = "lighter";
		trs.context.strokeStyle = "rgba(100, 100, 255, "+acb.caretOnDisplay+")";
		trs.context.beginPath();
		trs.context.lineWidth = 1;
		trs.context.moveTo(acb.caretPositionX+.5, acb.caretPositionY + -2+1);
		trs.context.lineTo(acb.caretPositionX +.5, acb.caretPositionY + 2+10);
		trs.context.closePath();
    	trs.context.stroke();
    	// trs.context.globalCompositeOperation = cop;

		//trs.TextBox.activeBox.caretOnDisplay
	}
	function showTextBox(x, y)
	{
		this.TextBox.x = x;
		this.TextBox.y = y;

		this.TextBox.isOnDisplay = true;
		this.update();	
	}
	function hideTextBox()
	{
		this.TextBox.isOnDisplay = false;
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
}());