(function(){
		function vPanel(trs){
			trs.proxyPanel = { activepanel: {
				x: 0, y: 0, w: 0, h: 0,
				bindings: [
					{refName: 'i', relative: {x: 0, y: 0, right: 0, bottom: 18, xrule: 'left', yrule: 'top', rrule: 'left', brule: 'abs'}, proxy: {}}
				],
				addTextBox: addTextBox, addButton: addButton,
				},
			};
			trs.RenderProxyPanels = RenderProxyPanels;
			trs.showProxyPanel = showProxyPanel;
			trs.ProxyPanelInteractionEntry = interactionEntry;
		}
		function interactionEntry(keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove)
		{
			var panel = this.proxyPanel.activepanel;

			for (var i = 0; i < panel.bindings.length; i++) {
				var proxy = panel.bindings[i].proxy;
				if(typeof proxy.interaction !== "undefined" && this.isFunction(proxy.interaction))
					proxy.interaction(this,keyboardDownEvent, keyboardUpEvent, mouseDown, mouseUp, mouseMove);
			}		
		}
		function addTextBox(trs, label, text, ismultiline, acceptedOrDeclined, relativity)
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
			this.context.fillStyle = "rgba(37, 51, 62, .8)";
			this.context.fillRect(panel.x, panel.y, panel.w, panel.h);

			for (var i = 0; i < panel.bindings.length; i++) {
				var proxy = panel.bindings[i].proxy;
				if(typeof proxy.render !== "undefined" && this.isFunction(proxy.render))
					proxy.render(this);
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
		truss_o.extendModule(vPanel, "view.ProxyPanel", ["view.Interface", "core.runtime", "view.Button", "view.TextBox"]);
}());