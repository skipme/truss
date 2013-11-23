(function(){
		function vPanel(trs){
			trs.proxyPanel = { activepanel: {
				bindings: [
					{refName: 'i', positionAndSize: 0, relativePos: {x: 0, y: 0}, visibility: 0, interaction: 0, focus: 0}
				]
			} };
		}
		function addBinding(refControlName, positionAndSize, relativePos, visibility, interaction, focus)
		{

		}
		truss_o.extendModule(vPanel, "view.ProxyPanel", ["view.Interface", "core.runtime"]);
}());