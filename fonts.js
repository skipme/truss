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
			var srcS = "src: ";
			for (var i = 0; i < src.length; i++) {
				srcS += (i>0?",":"") + "url(\"" + src[i] + "\") format(\"woff\")\n";
			};
			newStyle.appendChild(document.createTextNode(" \
			@font-face { \
  font-family: \""+ name +"\"; \
  "+srcS+"; \
  font-weight: normal; \
  font-style: normal; } \
			"));
			// src: url(\""+src+"\") format(\"woff\"); \
			document.head.appendChild(newStyle);
			this.fonts.familys.push(name);
			
			return name;
		}
		truss_o.extendModule(vFonts, "view.Fonts", ["view.Interface", "core.runtime"]);
}());