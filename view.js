
(function () {
    //"use strict";
    function cView(trs) {
        //
        updateBounds(trs);
        trs.updateBounds = function () { updateBounds(trs); }
        //
        trs.ViewEngines = [];
        // trs.CViewEnginesName = [];
        // trs.CViewEngines = [];
        trs.ActiveEngine = null;
        
        trs.addViewEngine = addEngine;
        trs.setViewEngine = setCurrentEngine;
        trs.FindViewEngine = FindEngine;
        trs.Clear = Clear;
        trs.ClearRect = ClearRect;
        trs.GetCanvasData = GetCanvasData;
        trs.PutCanvasData = PutCanvasData;
        trs.PutCanvasDataPart = PutCanvasDataPart;
        trs.SetShadow = Shadow;
        trs.drawArrow = drawArrow;

        trs.addEventCallback("NodeAdded", NodeAdded);
        trs.addEventCallback("NodesSeparated", NodesSeparated);
        trs.addEventCallback("NodeRemoved", NodeRemoved);
        trs.addEventCallback("Render", Render);
        trs.addEventCallback("update", update);
    }
    function updateBounds(trs) {
        trs.bounds = {
            width: trs.canvas.width, height: trs.canvas.height,
            //left: $(trs.canvas).position().left, top: $(trs.canvas).position().top
		left : trs.canvas.offsetLeft, top: trs.canvas.offsetTop
        };
    }
    function addEngine(name, iface) {
        var eng = this.FindViewEngine(name);
        if (eng < 0)
        { this.ViewEngines.push({ name: name, iface: iface }); }
        else { throw 'the view engine ' + name + ' already registered'; }
    }
    function setCurrentEngine(name) {
        var eng = this.FindViewEngine(name);
        if (eng < 0)
            throw 'the view interface ' + name + ' not found';
        // if (this.CViewEnginesName.indexOf(this.ViewEngines[eng].name) < 0) {
        //     this.CViewEnginesName.push(this.ViewEngines[eng].name);
        //     this.CViewEngines.push(this.ViewEngines[eng].iface);
        // } else {
        //     throw 'the view interface ' + name + ' already enabled';
        // }
        this.ActiveEngine = this.ViewEngines[eng];
    }
    function FindEngine(name) {
        for (var i = 0; i < this.ViewEngines.length; i++) {
            if (this.ViewEngines[i].name === name)
                return i;
        };
        return -1;
    }
    function Clear() {
        this.context.clearRect(0, 0, this.bounds.width, this.bounds.height);
    }
    function ClearRect(rect) {
        this.context.clearRect(rect.x, rect.y, rect.width, rect.height);
    }
    function GetCanvasData() {
        //this.context.save();
        var imageData = this.canvas;//this.context.getImageData(0, 0, this.bounds.width, this.bounds.height)
        //this.context.restore();
        //var image = new Image();
        //var imageData = this.context.getImageData(0, 0, this.bounds.width, this.bounds.height);

        return imageData;
    }
    function PutCanvasData(imageData) {
        //this.context.putImageData(imageData,0,0);
        this.context.drawImage(imageData, 0, 0);
    }
    function PutCanvasDataPart(imageData, x, y, dx, dy, dw, dh) {
        this.context.drawImage(imageData, x, y, dx, dy, dw, dh);
    }
    function NodeAdded(name, index) {
        this.update();
    }
    function NodesSeparated(indexa, indexb) {
        this.update();
    }
    function NodeRemoved(obj, index) {
        this.update();
    }
    function ViewProc(trs, foo) {
        // var iface;
        // for (var i = 0; i < trs.CViewEngines.length; i++) {
        //     iface = trs.CViewEngines[i];
        //     if (typeof iface === "undefined")
        //     { continue; }

        //     iface[foo].call(trs);
        // }
        if(trs.ActiveEngine !== null)
            trs.ActiveEngine.iface[foo].call(trs);
    }
    function Shadow(offsetX, offsetY, blur, color) {
        if (typeof offsetX === "undefined") {
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;
            this.context.shadowBlur = 0;
            this.context.shadowColor = 0;
        } else {
            this.context.shadowOffsetX = offsetX;
            this.context.shadowOffsetY = offsetY;
            this.context.shadowBlur = blur;
            this.context.shadowColor = color;//"rgba(0, 0, 0, 0.6)"; 
        }
    }
    function update() {
        ViewProc(this, 'update');
    }
    function Render() {
        ViewProc(this, 'Render');
    }
    function drawArrow(x1, y1, x2, y2, style, which, angle, d) {
        'use strict';
        style = typeof (style) != 'undefined' ? style : 3;
        which = typeof (which) != 'undefined' ? which : 1; // end point gets arrow
        angle = typeof (angle) != 'undefined' ? angle : Math.PI / 8;
        d = typeof (d) != 'undefined' ? d : 10;
        // default to using drawHead to draw the head, but if the style
        // argument is a function, use it instead
        var toDrawHead = typeof (style) != 'function' ? drawHead : style;

        // For ends with arrow we actually want to stop before we get to the arrow
        // so that wide lines won't put a flat end on the arrow.
        //
        var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var ratio = (dist - d / 3) / dist;
        var tox, toy, fromx, fromy;
        if (which & 1) {
            tox = x1 + (x2 - x1) * ratio;
            toy = y1 + (y2 - y1) * ratio;
        } else {
            tox = x2;
            toy = y2;
        }
        if (which & 2) {
            fromx = x1 + (x2 - x1) * (1 - ratio);
            fromy = y1 + (y2 - y1) * (1 - ratio);
        } else {
            fromx = x1;
            fromy = y1;
        }

        // Draw the shaft of the arrow
        this.context.beginPath();
        this.context.moveTo(fromx, fromy);
        this.context.lineTo(tox, toy);
        this.context.stroke();

        // calculate the angle of the line
        var lineangle = Math.atan2(y2 - y1, x2 - x1);
        // h is the line length of a side of the arrow head
        var h = Math.abs(d / Math.cos(angle));

        if (which & 1) {	// handle far end arrow head
            var angle1 = lineangle + Math.PI + angle;
            var topx = x2 + Math.cos(angle1) * h;
            var topy = y2 + Math.sin(angle1) * h;
            var angle2 = lineangle + Math.PI - angle;
            var botx = x2 + Math.cos(angle2) * h;
            var boty = y2 + Math.sin(angle2) * h;
            toDrawHead(this.context, topx, topy, x2, y2, botx, boty, style);
        }
        if (which & 2) { // handle near end arrow head
            var angle1 = lineangle + angle;
            var topx = x1 + Math.cos(angle1) * h;
            var topy = y1 + Math.sin(angle1) * h;
            var angle2 = lineangle - angle;
            var botx = x1 + Math.cos(angle2) * h;
            var boty = y1 + Math.sin(angle2) * h;
            toDrawHead(this.context, topx, topy, x1, y1, botx, boty, style);
        }
    }
    function drawHead(ctx, x0, y0, x1, y1, x2, y2, style) {
        'use strict';
        // all cases do this.
        //ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        switch (style) {
            case 0:
                // curved filled, add the bottom as an arcTo curve and fill
                var backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                ctx.arcTo(x1, y1, x0, y0, .55 * backdist);
                ctx.fill();
                break;
            case 1:
                // straight filled, add the bottom as a line and fill.
                ctx.lineTo(x0, y0);
                ctx.fill();
                break;
            case 2:
                // unfilled head, just stroke.
                ctx.stroke();
                break;
            case 3:
                //filled head, add the bottom as a quadraticCurveTo curve and fill
                var cpx = (x0 + x1 + x2) / 3;
                var cpy = (y0 + y1 + y2) / 3;
                ctx.quadraticCurveTo(cpx, cpy, x0, y0);
                ctx.fill();
                break;
            case 4:
                //filled head, add the bottom as a bezierCurveTo curve and fill
                var cp1x, cp1y, cp2x, cp2y, backdist;
                var shiftamt = 5;
                if (x2 == x0) {
                    // Avoid a divide by zero if x2==x0
                    backdist = y2 - y0;
                    cp1x = (x1 + x0) / 2;
                    cp2x = (x1 + x0) / 2;
                    cp1y = y1 + backdist / shiftamt;
                    cp2y = y1 - backdist / shiftamt;
                } else {
                    backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                    var xback = (x0 + x2) / 2;
                    var yback = (y0 + y2) / 2;
                    var xmid = (xback + x1) / 2;
                    var ymid = (yback + y1) / 2;

                    var m = (y2 - y0) / (x2 - x0);
                    var dx = (backdist / (2 * Math.sqrt(m * m + 1))) / shiftamt;
                    var dy = m * dx;
                    cp1x = xmid - dx;
                    cp1y = ymid - dy;
                    cp2x = xmid + dx;
                    cp2y = ymid + dy;
                }

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x0, y0);
                ctx.fill();
                break;
        }
        //ctx.restore();
    };
    truss_o.extendModule(cView, "view.Interface", ["core.Events", "core.Animate"]);
}());