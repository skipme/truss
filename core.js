/*******************/

var truss_o; 

(function(){
  //"use strict";
  //common
  var default_options = {test:"hello", test2:"world"};
  var log = function(msg){console.log(msg);};
  //extension & events
  var extendFunctions = [];

  function setOption (key, defaultvalue, force){
    if(key.indexOf('.')===-1){
        if(force || (this.options[key] === null || typeof this.options[key] === "undefined"))
         { this.options[key]=defaultvalue;}
    } else {
      var ks = key.split('.');
      var curopt =  this.options;
      for (var i = 0; i < ks.length-1; i++) {
        if(ks[i] === null || typeof ks[i] === "undefined")
         { throw 'The property path not well formed: ' + key + " defaultval: " + defaultvalue;}
        if(typeof curopt[ks[i]] === "undefined")
         { curopt[ks[i]] = {};}
        curopt = curopt[ks[i]];
      };

      curopt[ks[ks.length - 1]] = defaultvalue;
    }
  }
  function extendFunction(extendFunction, name, after){
    extendFunctions.push({name:name, after:after, foo:extendFunction});
  }
  function rnd(min,max)
  {
    return min + Math.floor((Math.random()*(max-min)+1));
  }
  function clone(o) {
     if(!o || 'object' !== typeof o)  {
       return o;
     }
     var c = 'function' === typeof o.pop ? [] : {};
     var p, v;
     for(p in o) {
     if(o.hasOwnProperty(p)) {
      v = o[p];
      if(v && 'object' === typeof v) {
        c[p] = clone(v);
      }
      else {
        c[p] = v;
      }
     }
    }
     return c;
  }
  
  function createFromCanvas(canvas)
  {
    var newtruss = clone(this);
    newtruss.canvas = canvas;
    newtruss.context = canvas.getContext("2d");

    registrateExtensionsFull(newtruss);
    
    delete newtruss.create;
    delete newtruss.extendModule;

    return newtruss;
  }

  function registrateExtensionsFull(newtruss)
  {
      var done;
      var prevreg = 0;
      while(!done)
      {
        done = registrateExtensions(newtruss);
        if(!done)
        {
          if(newtruss.options.registered.length == prevreg)
            throw 'missed some module';
        }
        prevreg = newtruss.options.registered.length;
      }
      log('extended by '+extendFunctions.length+" modules");
  }
  function registrateExtensions(newtruss)
  {
    // extend by all registered extensions
    var allregistered = true;
    newtruss.option("registered", new Array());
    var registered = newtruss.options.registered;

    for (var i = 0; i < extendFunctions.length; i++) {
      if(registered.indexOf(extendFunctions[i].name)>=0){continue;}
      
      var passed = true;
      if(typeof extendFunctions[i].after === "string")
      {
        if(registered.indexOf(extendFunctions[i].after)>=0)
        {
          passed = true;
        } else {
          passed=false;
        }
      } else if(typeof extendFunctions[i].after === "object")
      {
        passed = true;
        for (var j = 0; j < extendFunctions[i].after.length; j++) {
          if(registered.indexOf(extendFunctions[i].after[j])<0)
          {
            passed = false;
            break;
          }
        }
      } else if(typeof extendFunctions[i].after==="undefined") {
          passed = true;
      }

      if(passed) {
        extendFunctions[i].foo(newtruss);
        registered.push(extendFunctions[i].name);
        log('extended by '+extendFunctions[i].name);
      } else {
        allregistered = false;
      }
    }
    return allregistered;
  }

  function sayFunction(){log(this.options.test+' '+this.options.test2)};
  function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  } 
  
  uuid = (function() {
    // Private array of chars to use
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 
   
    return function (len, radix) {
      var chars = CHARS, uuid = [], rnd = Math.random;
      radix = radix || chars.length;
   
      if (len) {
        // Compact form
        for (var i = 0; i < len; i++) uuid[i] = chars[0 | rnd()*radix];
      } else {
        // rfc4122, version 4 form
        var r;
   
        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
   
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (var i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | rnd()*16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
          }
        }
      }
   
      return uuid.join('');
    };
  })();

  truss_o = {
    version: "0.1 devTool",
    options: default_options,
    option: setOption,
    say: sayFunction,
    rndm: rnd,
    extendModule: extendFunction,
    create: createFromCanvas,
    isFunction: isFunction,
    uuid: uuid,
    log: log
  }

  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
  })();
}());
