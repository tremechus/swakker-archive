

DivSprite = function(config){
	
	apply(this, {
		animMap: {},
		imgDir: '',
		x: 0,
		y: 0,
		callback: null,
		moveDelay: 100,
		screenScale: 1,
		renderTo: document.body,
	
		
		// Internal
		div: null,
		animation: null,
		animTimer: null,
		moveTimer: null,
		waitTimer: null,
		frame: 0,
		zIndex: 3000,
		scale: 1,
		
		loadImages: function() {
			
			for (key in this.animMap) {
				var anim = this.animMap[key];
				anim.id = key;
				if (!anim.imgName) {
					continue;
				}

				var frames = [];
				for (var i = 1; i <= anim.frameCount; i++) {
					var img = new Image();
					var name =  this.imgDir + '/' + anim.imgName + '' + i + '.png';
					img.src = name;
					frames.push(img);
				}				
				anim.frames = frames;
			}
		},
		
		show: function() {
			this.container = document.getElementById(this.renderTo) || document.body;
			this.container.appendChild(this.div);
			
			this._loop();
		},
		
		hide: function() {
			this.container.removeChild(this.div);
		},

		setPosition: function(x, y) {
			this.x = x;
			this.y = y;
		},
		
		moveTo: function(x, y, duration) {
			var me = this;
			
			if (me.moveTimer) {
				clearInterval(me.moveTimer);
			}
			
			duration = duration || 5000;
			
			var dx = (x - this.x) / (duration/me.moveDelay);
			var dy = (y - this.y) / (duration/me.moveDelay);

			me.moveTimer = setInterval(function() {

				var newX = Math.abs(x-me.x) < Math.abs(dx) ? x : me.x + dx;
				var newY = Math.abs(y-me.y) < Math.abs(dy) ? y : me.y + dy;

				me.setPosition(newX, newY);

				if (me.x == x && me.y == y) {
					clearInterval(me.moveTimer);
					me.moveTimer = null;
					if (me.callback) {
						me.callback({
							action: 'moveTo',
							x: x,
							y: y
						});
					}
				}						
			}, me.moveDelay);
		},

		wait: function(timeMillis) {
			var me = this;
			if (me.waitTimer) {
				clearTimeout(me.waitTimer);
			}
			
			me.waitTimer = setTimeout(function(){
				me.waitTimer = null;
				if  (me.callback) {
					me.callback({
						action: 'wait'
					});
				}
			}, timeMillis);
		},
		
		setAnimation: function(animKey) {
			var me = this;
			me.animation = me.animMap[animKey];
			me.frame = 0;
			if (me.animTimer) {
				clearInterval(me.animTimer);
				me.animTimer = null;
			}
			
			me.animTimer = setInterval(function(){
				me._loop();
			}, me.animation.delay);
		},

		_loop: function() {
			var me = this;
			if (!me.animation) {
				return;
			}
			var image = me.animation.frames[me.frame];
			var imgWidth = Math.round(image.width * me.screenScale * me.scale);
			var imgHeight = Math.round(image.height * me.screenScale * me.scale);
			me.div.style.width = imgWidth + 'px';
			me.div.style.height = imgHeight + 'px';
			me.div.style.left = (me.x - imgWidth/2 - (me.animation.offsetX* me.screenScale||0) - (me.offsetX* me.screenScale||0)) + 'px';
			me.div.style.top = (me.y - imgHeight/2 - (me.animation.offsetY* me.screenScale||0) - (me.offsetY* me.screenScale||0)) + 'px';
			me.img.src = image.src;
			
			me.frame++;
			if (me.frame == me.animation.frameCount) {
				if (me.animation.loop) {
					me.frame = 0;
				}
				else {
					clearInterval(me.animTimer);
					if (me.callback) {
						me.callback({
							animation: this.animation,
							action: 'animate'
						});
					}
					return;
				}
			}
		}
		
	});
	apply(this, config);
	
	this.div = document.createElement('div');
	this.div.style.position = 'absolute';
	this.div.style.zIndex = this.zIndex;

	this.img = document.createElement('img');
	this.img.style.width = '100%';
	this.img.style.height = '100%';
	this.img.style.position = 'absolute';
	this.img.style.left = '0px';
	this.img.style.top = '0px';
	
	this.div.appendChild(this.img);
	
	this.loadImages();	

};

