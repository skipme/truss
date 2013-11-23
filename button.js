(function(){
		function vButton(trs){
			trs.buttons = {
				buttons: [
				{
					x:0, y: 0, w: 0, h: 0, 
					visible: 1, interaction: interaction, focus: 0, 
					render: renderButton,
					caption: "OK", font: "12px Verdana", fontheight: 12 
				}],
				buttonNames: []
			}; 
			trs.addButton = addButton;
		}
		function setTextParams(trs, button)
		{
			trs.SetShadow();
			trs.context.font = button.font;
			trs.context.textBaseline = "bottom";// "top";
			trs.context.textAlign = 'start';
			trs.context.fillStyle = "rgba(0, 0, 255, 1)";//"rgb(0, 0, 0)";
		}
		function renderButton(trs)
		{
			var button = this;

			trs.context.fillStyle = "rgba(255, 187, 40, 1)";//"rgba(255, 255, 255, 0.6)";
			trs.context.fillRect(button.x-4, button.y-4, button.w+4, button.h+4);
			setTextParams(trs, button);
			trs.context.fillText(button.caption, button.x, button.y + button.fontheight);
		}
		function interaction()
		{

		}
		function addButton(name, caption, font, fontheight, callback)
		{
			this.buttons.buttonNames[name] = this.buttons.buttons.length;
			var button = {
					x:0, y: 0, w: 0, h: 0, 
					visible: 1, interaction: interaction, focus: 0, 
					render: renderButton,
					caption: caption, font: font, fontheight: fontheight, callback: callback
			};
			this.buttons.buttons.push(button);
			return button;
		}
		truss_o.extendModule(vButton, "view.Button", ["view.Interface", "core.runtime"]);
}());