var canvas;
var context;
var t;
var time = new Date();

var x;
var y;

function animateBeam() {
    var ntime = new Date();
    var offset = ntime - time;
    time = ntime;
    context.clearRect(0,0,600,600);
   
  //context.shadowOffsetX = 2;
  //context.shadowOffsetY = 2;
  //context.shadowBlur = 2;
  //context.shadowColor = "rgba(0, 0, 0, 0.5)";
  
  context.font = "20px Times New Roman";
  context.fillStyle = "Black";
  context.fillText(offset.toString() +" "+ 1000/offset, 5, 30);
    
    //ctx.fillStyle = "Red";
  context.fillRect(x,y,50,24);
  x+=1;
  if(x>100)x=0;
}

window.onload = function() {
    canvas = document.getElementById("zCanvas");
    context = canvas.getContext("2d");
y=80;x=10;
   var t = setInterval(animateBeam, 1000/25);
};