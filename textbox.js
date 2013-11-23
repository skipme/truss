(function(){

	function cTextBox(trs){
		trs.TextBox = { x: 0, y: 0, width: 128, height: 14, isOnDisplay: false, activeBox:
		 {
		 	multiline: false, label: "nolabel",
		 	caretOnDisplay: 0.1, caretOnDisplayAlphaIncStep: 3*1.0/30, caretSETupDownX: 0, caretPositionX: 0, caretPositionY: 0, 
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
		trs.TextBoxShow = showTextBox;
		trs.TextBoxHide = hideTextBox;
		trs.TextBoxTextGet = GetText;
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
				visible: 1, interaction: interactionInput, focus: 0, 
				render: renderTextBox,
				// caption: caption, font: font, fontheight: fontheight, callback: callback,
				
				caretSETupDownX: 0, caretPositionX: 0, caretPositionY: 0, 
		 		state: {isDragging: false, selection: {left: 0, right: 0}}, measured: false, caretLine: 0, caretIndex: -1,
		 		label: label, 
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
	function shHideCaretAndFade()
	{
		// if(this.TextBox.isOnDisplay || this.TextBox.activeBox.fadeOut)
		{
			this.TextBox.activeBox.caretOnDisplay += this.TextBox.activeBox.caretOnDisplayAlphaIncStep;
			if(this.TextBox.activeBox.caretOnDisplay < 0 || this.TextBox.activeBox.caretOnDisplay >= 1)
			{
				var mod =3*1.0/(30/(60/(this.fps.rate>60?60:this.fps.rate)));

				if(this.TextBox.activeBox.caretOnDisplay < 0)
					this.TextBox.activeBox.caretOnDisplayAlphaIncStep = mod;
				else this.TextBox.activeBox.caretOnDisplayAlphaIncStep = mod * -1;

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
				if(hittestrect(this.x-4, this.lines[i].y, this.w, 12, mx, my))
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
		}else if(mouseUp !== null && mouseUp.which === 1)
		{
			var e = mouseUp;
			var mx = trs.runtime.mx;
			var my = trs.runtime.my;
			// set caret position
			// assume drag over point

			setTextParams(trs)
			for (var i = 0; i < this.lines.length; i++) {
				if(hittestrect(this.x-4, this.lines[i].y, this.w, 12, mx, my))
				{ 
					hitCursorToCaret(trs, this, i, mx);
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
						this.measured = false;
						this.lines.splice(this.caretLine+1, 1);
					}
				}else{
					var newleft = str.substr(0, this.caretIndex);
					setTextParams(trs)
					var dim = trs.context.measureText(newleft);
					this.lines[this.caretLine].t =  newleft + str.substr(this.caretIndex+1, str.length - this.caretIndex-1);
					this.caretIndex--;
					this.caretSETupDownX = this.caretPositionX = dim.width;
					this.measured = false;
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
			}else if(e.keyCode === 40 && this.TextBox.multiline)// down arrow
			{
				this.caretLine++;
				if(this.caretLine >= this.lines.length)
					this.caretLine = this.lines.length - 1;

				hitCursorToCaret(trs, this, this.caretLine, this.caretSETupDownX);

			}else if(e.keyCode === 38 && this.TextBox.multiline)// up arrow
			{
				this.caretLine--;
				if(this.caretLine < 0)
					this.caretLine = 0;
				hitCursorToCaret(trs, this, this.caretLine, this.caretSETupDownX);

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
					if(this.caretLine === this.lines.length)
						this.lines.push({t: "xu", w: 0, davw: 0, y: 0});
					else this.lines.splice(this.caretLine, 0, {t: "xu", w: 0, davw: 0, y: 0});

					this.lines[this.caretLine-1].t = str.substr(0, this.caretIndex+1);
					this.lines[this.caretLine].t = str.substr(this.caretIndex+1, str.length-this.caretIndex-1);
					this.caretIndex = -1;
					this.caretPositionY = this.lines[this.caretLine-1].y+12;
					this.caretSETupDownX = this.caretPositionX = 0;
					this.measured = false;
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
				// console.log(keychar)
			}
		}
	}
	function hitCursorToCaret(trs, textbox, lineIndex, x)
	{
		// var acb = trs.TextBox.activeBox;

		var avgindex = -1;
		if(textbox.lines[lineIndex].t.length > 0)
		{
			avgindex = Math.floor((x-textbox.x) / textbox.lines[lineIndex].davw)-1;
			if(avgindex < -1)
				avgindex = -1;
			
			setTextParams(trs);
			
			var tl = textbox.lines[lineIndex].t.length;
			var dim = trs.context.measureText(textbox.lines[lineIndex].t.substr(0,avgindex+1));

			if(avgindex >= tl)
			{	
				avgindex = tl-1;

			}else{

				while((dim.width + textbox.x < x) && avgindex >= 0 && avgindex < tl)
				{
					avgindex ++;
					dim = trs.context.measureText(textbox.lines[lineIndex].t.substr(0,avgindex+1));
				}
				var delta1 = dim.width + textbox.x - x;
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
		trs.context.fillStyle = "rgba(255, 187, 40, "+Math.min(0.8,acb.fadeIn)+")";//"rgba(255, 255, 255, 0.6)";
		trs.context.fillRect(textbox.x-4, textbox.y-4, textbox.w+4, textbox.h+4);
		trs.SetShadow();
		trs.context.fillStyle = "rgba(111, 111, 111, "+Math.min(0.8,acb.fadeIn)+")";//"rgba(255, 255, 255, 0.6)";
		trs.context.fillRect(textbox.x-4, textbox.y-(4+12+2), textbox.w+4, 12+2);
		
		trs.context.font = "10px Verdana";
		trs.context.fillStyle = "rgba(255, 255, 255, "+acb.fadeIn+")";
		trs.context.fillText(textbox.label+":", textbox.x, textbox.y-2-2);
	}

	function setTextParams(trs)
	{
		trs.SetShadow();
		trs.context.font = "12px Verdana";
		trs.context.textBaseline = "bottom";// "top";
		trs.context.textAlign = 'start';
		trs.context.fillStyle = "rgba(0, 0, 0, "+trs.TextBox.activeBox.fadeIn+")";//"rgb(0, 0, 0)";
	}
	function drawTextBoxText(trs, textbox, measureOnly)
	{
		setTextParams(trs)
		// ---
		for (var i = 0; i < textbox.lines.length; i++) {
			if(measureOnly)
			{
				var dim = trs.context.measureText(textbox.lines[i].t);
				textbox.lines[i].w = dim.width;
				textbox.lines[i].davw = dim.width / textbox.lines[i].t.length;
				textbox.lines[i].y = textbox.y + (i*12);
			}
			else
			{		
				trs.context.fillText(textbox.lines[i].t, textbox.x, textbox.lines[i].y+12);
			}
			if(!textbox.multiline)
				break;
		};
		if(measureOnly)
		{
			textbox.measured = true;
			return;
		}
		// ---

		trs.context.strokeStyle = "rgba(0, 0, 0, "+Math.min(trs.TextBox.activeBox.caretOnDisplay, trs.TextBox.activeBox.fadeIn)+")";
		trs.context.beginPath();
		trs.context.lineWidth = 1;
		trs.context.moveTo(textbox.caretPositionX + textbox.x +.5, textbox.lines[textbox.caretLine].y + -2+1);
		trs.context.lineTo(textbox.caretPositionX + textbox.x +.5, textbox.lines[textbox.caretLine].y + 2+10);
		trs.context.closePath();
    	trs.context.stroke();
	}
	function showTextBox(x, y, label, text, ismultiline, acceptedOrDeclined)
	{
		if(x === "right")
		{
			x = this.bounds.width - this.TextBox.width - 4; 
		}
		this.TextBox.x = x;
		this.TextBox.y = y;

		this.TextBox.activeBox.acceptedOrDeclined = acceptedOrDeclined;
		this.TextBox.activeBox.label = label;
		this.TextBox.activeBox.text = text;
		this.TextBox.activeBox.lines = [{t: text, w: 0, davw: 0, y: y}];
		hitCursorToCaret(this, 0, x+1,y+1)
		this.TextBox.activeBox.fadeIn = 0;
		this.TextBox.activeBox.measured = false;
		this.TextBox.isOnDisplay = true;

		this.update();	
	}
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
}());