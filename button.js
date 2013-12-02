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

			trs.context.fillStyle = (button.hover || button.focus)?"rgba(255, 255, 255, 1)" :"rgba(111, 111, 111, 1)";//"rgb(0, 0, 0)";
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
			}else if(keyboardDownEvent !== null && this.focus)
			{
				if(keyboardDownEvent.keyCode === 13)// enter
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
}());