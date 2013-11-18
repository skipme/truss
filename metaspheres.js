(function(){
	//"use strict";
	var threshold = 230;
	function metaSpheres(trs)
	{
		var r = trs.runtime;
		r.metaSpheres = { gradients: [], tex: trs.CreateTexture(trs.bounds.width, trs.bounds.height) };
	
		trs.MetaPrepareGradient = prepareOval;
		trs.MetaDrawGradient = drawOval;
		trs.MetaPostProcess = postProcess;
		trs.postEffectA = postEffectA;
		trs.postEffectA_ = postEffectA_;
		r.metaSpheres.patIMG = trs.LoadImage('img/pattern.png', function(image){
			r.metaSpheres.patFS = trs.context.createPattern(image, "repeat")
		});
		
	}
	function prepareOval(radius)
	{
		var tex = this.CreateTexture(radius * 2, radius * 2);
		var tctx = tex.getContext("2d");
		var grad = tctx.createRadialGradient(
                    radius,
                    radius,
                    1,
                    radius,
                    radius,
                    radius
                    );
		colour = 
		'hsla(' + Math.round(Math.random() * 360) + ', 80%, 60%';
		// grad.addColorStop(0, 'rgba(255,255,255, 1)');
  //       grad.addColorStop(1, 'rgba(255,255,255, 0)');
        grad.addColorStop(0, colour + ',1)');
        grad.addColorStop(1, colour + ',0)');
        tctx.fillStyle = grad;
        tctx.beginPath();
        tctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
        tctx.closePath();
        tctx.fill();

        this.runtime.metaSpheres.gradients.push(tex);

        return this.runtime.metaSpheres.gradients.length - 1;
	}
	function drawOval(grad, x, y, w, h)
	{
		var grad = this.runtime.metaSpheres.gradients[grad];
		this.DrawTexture(grad, x-grad.width*.5, y-grad.height*.5, w, h);
	}
	function postProcess() 
	{
        var imageData = this.context.getImageData(0, 0, this.bounds.width, this.bounds.height),
            pix = imageData.data;

        for (var i = 0, n = pix.length; i < n; i += 4) {
            if(pix[i + 3] < threshold)(pix[i + 3] *= .2222);

        }

        this.context.putImageData(imageData, 0, 0);
    };
    function postEffectA()
    {
    	if(typeof this.runtime.metaSpheres.patFS === 'undefined')
    		return;
		 this.context.globalCompositeOperation = "xor";
		 this.context.fillStyle = this.runtime.metaSpheres.patFS;
		 this.context.fillRect(0, 0, this.bounds.width, this.bounds.height);
		 this.context.globalCompositeOperation = "source-over";
		 this.context.fillStyle = "rgb(255, 255, 255)"
    }
    function postEffectA_()
    {
    	var pixw = 4;
    	var skipp = false;

    	var skipx = false;
		var skipy = false;

        var imageData = this.context.getImageData(0, 0, this.bounds.width, this.bounds.height);
  //       var pix = imageData.data;
  //       var step = pix.length / pixw;
		// for (var i = 0; i < pix.length; i+=pixw) {
		// 	var index = i * 4;
		
		// 	for (var p = 0; p < pixw; p++) {
		// 		 pix[index +p*this.bounds.width + 4] = .02222;
		// 	};
		
		// };

		var o = conv(imageData, [ 1/2, 1/3, 1/4,
    1/5, 1/6, 1/6 ], 0, this.runtime.metaSpheres.tex);
		//(this.runtime.metaSpheres.tex.getContext('2d')).putImageData(o, 0, 0);
		//this.context.globalCompositeOperation = "lighter";
		//this.Clear();
		 //this.context.drawImage(this.runtime.metaSpheres.tex,0,0);
         this.context.putImageData(o, 0, 0);
    }
    function conv(pixels, weights, opaque,tex) {
	  var side = Math.round(Math.sqrt(weights.length));
	  var halfSide = Math.floor(side/2);
	  var src = pixels.data;
	  var sw = pixels.width;
	  var sh = pixels.height;
	  // pad output by the convolution matrix
	  var w = sw;
	  var h = sh;
	   var output = (tex.getContext('2d')).createImageData(w, h);
	   var dst = output.data;
	  //var dst = src;
	  // go through the destination image pixels
	  var alphaFac = opaque ? 1 : 0;
	  for (var y=0; y<h; y++) {
	    for (var x=0; x<w; x++) {
	      var sy = y;
	      var sx = x;
	      var dstOff = (y*w+x)*4;
	      // calculate the weighed sum of the source image pixels that
	      // fall under the convolution matrix
	      var r=0, g=0, b=0, a=0;
	      for (var cy=0; cy<side; cy++) {
	        for (var cx=0; cx<side; cx++) {
	          var scy = sy + cy - halfSide;
	          var scx = sx + cx - halfSide;
	          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
	            var srcOff = (scy*sw+scx)*4;
	            var wt = weights[cy*side+cx];
	            r += src[srcOff] * wt;
	            g += src[srcOff+1] * wt;
	            b += src[srcOff+2] * wt;
	            a += src[srcOff+3] * wt;
	          }
	        }
	      }
	      dst[dstOff] = r;
	      dst[dstOff+1] = g;
	      dst[dstOff+2] = b;
	      dst[dstOff+3] = a + alphaFac*(255-a);
	    }
	  }
	  return output;
	};
	truss_o.extendModule(metaSpheres, "view.Metaspheres", ["view.Images", "view.Interface", "view.Layers", "core.Events", "core.runtime"]);
}());