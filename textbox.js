(function(){

	function cTextBox(trs){
		trs.TextBox = { x: 0, y: 0, width: 128, height: 14, isOnDisplay: false, activeBox:
		 {
		 	multiline: false, label: "nolabel",
		 	caretOnDisplay: 1, caretOnDisplayAlphaIncStep: 3*1.0/30, caretSETupDownX: 0, caretPositionX: 0,
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
				acceptedOrDeclined: acceptedOrDeclined,
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
		var tlines = text.split("\n"); 
		this.lines.length = tlines.length;
		//this.lines[0] = {t: text, w: 0, davw: 0, y: 0};
		for (var i = 0; i < tlines.length; i++) {
			this.lines[i] = {t: tlines[i], w: 0, davw: 0, y: 0};
		};
		this.measured = false;
		this.scrollx = this.scrolly = this.caretLine = this.caretPositionX = 0;
		this.caretIndex = -1;
		this.text = text;
	}
	function getText()
	{
		var result = "";
		for (var i = 0; i < this.lines.length; i++) {
			result += this.lines[i].t + (i+1< this.lines.length?"\n":"");
		};
		return result;
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

					}else if(e.keyCode == 27) // esc
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
}());