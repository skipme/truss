(function(){
		function vFonts(trs){
			trs.fonts = {
				familys: []
			}; 
			trs.loadFont = loadFont;
		}
		function loadFont(name, src)
		{
			if(this.fonts.familys.indexOf(name)>=0)
				return name;

			var newStyle = document.createElement('style');
			newStyle.appendChild(document.createTextNode(" \
			@font-face { \
  font-family: \""+ name +"\"; \
 \
  src: url(\""+src+"\") format(\"woff\"); \
  font-weight: normal; \
  font-style: normal; } \
			"));
			document.head.appendChild(newStyle);
			this.fonts.familys.push(name);
			
			return name;
		}
		truss_o.extendModule(vFonts, "view.Fonts", ["view.Interface", "core.runtime"]);
}());