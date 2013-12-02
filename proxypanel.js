(function(){
		function vPanel(trs){
			trs.proxyPanel = { 
				activepanel: {
				x: 0, y: 0, w: 0, h: 0,
				visible: false,
				bindings: [
					// {refName: 'i', 
					// relative: {x: 0, y: 0, right: 0, bottom: 18, xrule: 'left', yrule: 'top', rrule: 'left', brule: 'abs'}, 
					// proxy: {}}
				],
				addTextBox: addTextBox, addButton: addButton, getControl: getControl,
				Show: FadeIn, Hide: FadeOut
				},
			};
			trs.RenderProxyPanels = RenderProxyPanels;
			trs.showProxyPanel = showProxyPanel;
			trs.ProxyPanelInteractionEntry = interactionEntry;
			trs.CreateTimer(1000/60, shHideCaretAndFade);
		}
		function shHideCaretAndFade()
		{

			if(this.proxyPanel.activepanel.visible)
			{
				var mod =2*1.0/(60/(60/(this.fps.rate>60?60:this.fps.rate)));

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
		function interactionEntry(keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove)
		{
			if(this.proxyPanel.activepanel.visible)
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

				}else if (keyboardDownEvent !== null)
				{
					if(keyboardDownEvent.keyCode === 9) // tab
					{
						for (var i = 0; i < panel.bindings.length; i++) {
							var proxy = panel.bindings[i].proxy;
							if(proxy.focus)
							{
								proxy.focus = false;
								if(i+1 < panel.bindings.length)
									panel.bindings[i +1].proxy.focus = true;
								else if(i !== 0)
									panel.bindings[0].proxy.focus = true;
								else proxy.focus = true;

								break;
							}
						}
						return;
					}
				}

				for (var i = 0; i < panel.bindings.length; i++) {
					var proxy = panel.bindings[i].proxy;
					if(typeof proxy.interaction !== "undefined" && this.isFunction(proxy.interaction))
						proxy.interaction(this,keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove);
				}	
			}	
		}
		function FadeIn(trs)
		{
			this.visible = true;
			trs.update();
		}
		function FadeOut(trs)
		{
			this.visible = false;
			for (var i = 0; i < this.bindings.length; i++) {
				var proxy = this.bindings[i].proxy;
				proxy.focus = proxy.hover = false;
			}	
			trs.update();
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
			if(panel.visible){
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
				relativePos: relativePos, visible: visibility,
				interaction: interaction, focus: focus});
		}
		function hittestrect(x,y,w,h,hitX,hitY) {
			return(x<hitX&&x+w>=hitX&&y<hitY&&y+h>=hitY);
		}
		truss_o.extendModule(vPanel, "view.ProxyPanel", ["view.Interface", "core.runtime", "view.Button", "view.TextBox"]);
}());