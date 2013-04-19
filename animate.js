(function(){

	var fpsFilter = 10;
	function cAnimate(trs){
		trs.fps = {};
		trs.fps.rate = 0; trs.fps.now = 0; trs.fps.lastUpdate = (new Date)*1 - 1;
		trs.addEvent('Render');
		trs.addEvent('update');

		trs.StopAnim = false;
		trs.SuspendFrame = false;
		trs.animFrame = Frame;
		trs.option('animFps', 30); 
		trs.animFPS = 0; 


		//function explicitframe(){Frame(trs);}
		//trs.runtime.anim_interval = setInterval(explicitframe, 1000 / trs.options.animFps);
		
		implicitframe(trs);

		trs.timers = [];
		trs.CreateTimer = CreateTimer;
		
		trs.uselessFrames = 500;
		trs.suspendAnimation = Suspend;
		trs.update = Update;
	}
	function Frame(trs)
	{
		var thisFrameFPS = 1000 / ((trs.fps.now=new Date) - trs.fps.lastUpdate);
  			trs.fps.rate += (thisFrameFPS - trs.fps.rate) / fpsFilter;
  			trs.fps.lastUpdate = trs.fps.now;
  			
		if(!trs.StopAnim)
		{
			if(trs.uselessFrames<=-5){
				trs.suspendAnimation();
			}
			trs.invokeEvent('Render');
			trs.uselessFrames--;
		}
	}
	function CreateTimer(interval,callback)
	{
		var self = this;
		var tID = setInterval(function(){callback.call(self);}, interval);
		this.timers.push(tID);
	}
	function explicitframe(trs){
		trs.animFrame(trs);
	}
	function implicitframe(trs){
		explicitframe(trs); 
		if(!trs.SuspendFrame){
			requestAnimFrame(function(){implicitframe(trs);});
		}
	}
		
	function Suspend()
	{
		this.SuspendFrame = true;
	}
	function Update()
	{
		if(this.SuspendFrame)
		{
			this.SuspendFrame = false;
			this.uselessFrames = 30;
			implicitframe(this);
			console.log("frame loop-->");
		}
		else
		{
			this.uselessFrames = 30;
		}
		this.invokeEvent('update');
	}
	truss_o.extendModule(cAnimate, "core.Animate", ["core.Events", "core.runtime"]);
}());