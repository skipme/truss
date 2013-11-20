(function(){

	function cTextBox(trs){
		trs.TextBox = { x: 0, y: 0, width: 256, height: 12, isOnDisplay: false, activeBox:
		 {multiline: false,  
		 	caretOnDisplay: 0.1, caretOnDisplayAlphaIncStep: 3*1.0/30, caretSETupDownX: 0, caretPositionX: 0, caretPositionY: 0, 
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

		trs.canvas.style.cursor = 'text';
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
	var ignoreCodes = [95,93,125,123,91,160,171,92,8230,187];
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

			setTextParams(this)
			for (var i = 0; i < acb.lines.length; i++) {
				if(hittestrect(this.TextBox.x-4, acb.lines[i].y, this.TextBox.width, 12, mx, my))
				{ 
					hitCursorToCaret(this, i, mx);
					acb.caretSETupDownX = acb.caretPositionX;
				}
			};

		}else if(keyboardDownEvent !== null){
			var e = keyboardDownEvent;
			if(e.keyCode === 8)// backspace
			{ 
				var str = acb.lines[acb.caretLine].t;
				var newleft = str.substr(0, acb.caretIndex);
				setTextParams(this)
				var dim = this.context.measureText(newleft);
				acb.lines[acb.caretLine].t =  newleft + str.substr(acb.caretIndex+1, str.length - acb.caretIndex-1);
				acb.caretIndex--;
				acb.caretSETupDownX = acb.caretPositionX = dim.width + this.TextBox.x;
				this.TextBox.activeBox.measured = false;
			}else if(e.keyCode === 37)// left arrow
			{
				if(e.ctrlKey)
				{
					var letterscoped = false;
					var ctrace = acb.caretIndex;
					while(ctrace >= 0)
					{
						var chc = acb.lines[acb.caretLine].t.charCodeAt(ctrace);
       					if(ignoreCodes.indexOf(chc) >= 0 || (chc <=64 && chc >= 0))
       					{
       						if(letterscoped){
	       						acb.caretIndex = ctrace; 
	       						break;
	       					}
       					}else{
       						if(!letterscoped)
       							letterscoped = true;
       					}
						ctrace--;
					}
					if(ctrace === -1 && letterscoped)
						acb.caretIndex = -1;
				}else{
					acb.caretIndex--;
				}
				if(acb.caretIndex < -1)//clip
					acb.caretIndex = -1;
				setTextParams(this);
				var dim = this.context.measureText(acb.lines[acb.caretLine].t.substr(0, acb.caretIndex+1));
				acb.caretSETupDownX = acb.caretPositionX = dim.width + this.TextBox.x;
			}else if(e.keyCode === 39)// right arrow
			{
				if(e.ctrlKey)
				{
					var letterscoped = false;
					var nextword = false;
					var ctrace = acb.caretIndex;
					var tl = acb.lines[acb.caretLine].t.length;
					while(ctrace < tl)
					{
						var chc = acb.lines[acb.caretLine].t.charCodeAt(ctrace);
       					if(ignoreCodes.indexOf(chc) >= 0 || (chc <=64 && chc >= 0))
       					{
       						if(letterscoped)
       							nextword = true;
 
       					}else{
       						if(!letterscoped)
       							letterscoped = true;
       						else if(nextword)
       						{
	       						acb.caretIndex = ctrace-1; 
	       						break;
       						}
       					}
						ctrace++;
					}
					if(ctrace === tl && letterscoped)
						acb.caretIndex = tl - 1;
				}else{
					acb.caretIndex++;
				}

				if(acb.caretIndex > acb.lines[acb.caretLine].t.length)//clip
					acb.caretIndex = acb.lines[acb.caretLine].t.length - 1;
				setTextParams(this);
				var dim = this.context.measureText(acb.lines[acb.caretLine].t.substr(0, acb.caretIndex+1));
				acb.caretSETupDownX = acb.caretPositionX = dim.width + this.TextBox.x;
			}else if(e.keyCode === 40)// down arrow
			{
				acb.caretLine++;
				if(acb.caretLine >= acb.lines.length)
					acb.caretLine = acb.lines.length - 1;

				hitCursorToCaret(this, acb.caretLine, acb.caretSETupDownX);

			}else if(e.keyCode === 38)// up arrow
			{
				acb.caretLine--;
				if(acb.caretLine < 0)
					acb.caretLine = 0;
				hitCursorToCaret(this, acb.caretLine, acb.caretSETupDownX);

			}else if(e.keyCode === 46)// del/delete
			{
				var str = acb.lines[acb.caretLine].t;
				if(str.length >= acb.caretIndex+2)
				{
					var newleft = str.substr(0, acb.caretIndex+1);

					acb.lines[acb.caretLine].t =  newleft + str.substr(acb.caretIndex+2, str.length - acb.caretIndex-1);
					this.TextBox.activeBox.measured = false;
				}

			}else{
				// input
		        var key = e.keyCode || e.which; // alternative to ternary - if there is no keyCode, use which
	      		var keychar = String.fromCharCode(key);

	      		var str = acb.lines[acb.caretLine].t;
	      		var left = str.substr(0, acb.caretIndex+1);

				acb.lines[acb.caretLine].t = left+keychar+str.substr(acb.caretIndex+1, str.length-acb.caretIndex-1);
				
				setTextParams(this)
				var dim = this.context.measureText(left+keychar);
				acb.caretSETupDownX = acb.caretPositionX = dim.width + this.TextBox.x;
				this.TextBox.activeBox.measured = false;
				acb.caretIndex++;
				console.log(keychar)
			}
		}
	}
	function hitCursorToCaret(trs, lineIndex, x)
	{
		var acb = trs.TextBox.activeBox;

		var avgindex = Math.floor((x-trs.TextBox.x) / acb.lines[lineIndex].davw)-1;
		if(avgindex < -1)
			avgindex = -1;
		
		setTextParams(trs);
		
		var tl = acb.lines[lineIndex].t.length;
		var dim = trs.context.measureText(acb.lines[lineIndex].t.substr(0,avgindex+1));
		if(avgindex >= tl)
		{	
			avgindex = tl-1;

		}else{

			while((dim.width + trs.TextBox.x < x) && avgindex >= 0 && avgindex < tl)
			{
				avgindex ++;
				dim = trs.context.measureText(acb.lines[lineIndex].t.substr(0,avgindex+1));
			}
			var delta1 = dim.width + trs.TextBox.x - x;
			var dim2 = trs.context.measureText(acb.lines[lineIndex].t.substr(0,avgindex));
			//var delta2 = Math.abs(dim.width + trs.TextBox.x - x);
			if(delta1 > 3)
			{	
				avgindex--;
				dim = dim2;
			}
		}
		acb.caretPositionX = dim.width + trs.TextBox.x;
		acb.caretPositionY = acb.lines[lineIndex].y;
		acb.caretIndex = avgindex;
		acb.caretLine = lineIndex;
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
	function setTextParams(trs)
	{
		trs.context.font = "10pt Verdana";
		trs.context.textBaseline ="top";
		trs.context.textAlign = 'start';
		trs.context.fillStyle = "rgb(0, 0, 0)";
	}
	function drawTextBoxText(trs, measureOnly)
	{
		setTextParams(trs)
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
		trs.context.strokeStyle = "rgba(0, 0, 0, "+acb.caretOnDisplay+")";
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