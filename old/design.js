var canvas;
var context;

window.onload = function() {
    canvas = document.getElementById("zCanvas");
    context = canvas.getContext("2d");

    var gradient = context.createRadialGradient(280, 320, 0, 300, 300, 500);
    gradient.addColorStop(0, "rgba(60, 78, 98, 1)");
    gradient.addColorStop(1, "rgba(35, 47, 59, 1)");

    context.fillStyle = gradient;
    context.fillRect(0,0,600,600);


    context.beginPath();
    context.moveTo(100, 100);
    context.lineTo(200, 100);
    context.lineWidth = 1;
    context.strokeStyle = "#ffffff";
    context.lineCap = "butt";
    context.stroke();

    context.beginPath();
    context.moveTo(100, 100);
    context.lineTo(200, 200);
    context.lineWidth = 1;
    context.strokeStyle = "#ffffff";
    context.lineCap = "butt";
    context.stroke();

    context.beginPath();
    context.moveTo(100, 100);
    context.lineTo(100, 200);
    context.lineWidth = 1;
    context.strokeStyle = "#ffffff";
    context.lineCap = "butt";
    context.stroke();

    context.beginPath();
    context.arc(150, 150, 10, 0, 2 * Math.PI, false);
    context.fillStyle = "rgba(0, 0, 0, 0.3)";
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "#FFFFFF";
    context.stroke();

    context.beginPath();
    context.arc(150, 150, 16, 0, 2 * Math.PI, false);
    //context.fillStyle = "rgba(0, 0, 0, 0.3)";
    //context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "#FFFFFF";
    context.stroke();

    context.save();
    context.translate(200,200);
    context.rotate(87*Math.PI/180);

    // context.beginPath();
    // context.arc(0, 0, 16, 0, 1.0 * Math.PI, false);
    // //context.fillStyle = "rgba(0, 0, 0, 0.3)";
    // //context.fill();
    // context.lineWidth = 1;
    // context.strokeStyle = "#FF0000";
    // context.stroke();

    context.restore();

    context.beginPath();
    context.arc(200, 200, 16, 0, 1.0 * Math.PI, false);
    //context.fillStyle = "rgba(0, 0, 0, 0.3)";
    //context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "#FFFFFF";
    context.stroke();


    context.beginPath();
    context.arc(150, 200, 16, 0, 2 * Math.PI, false);
    context.fillStyle = "rgba(0, 0, 0, 0.3)";
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "#FFFFFF";
    context.stroke();

    context.beginPath();
    context.arc(150, 250, 16, 0, 2 * Math.PI, false);
    context.fillStyle = "rgba(106, 168, 185, 0.3)";
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "#FFFFFF";
    context.stroke();
};


