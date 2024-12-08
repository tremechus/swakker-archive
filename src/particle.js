
LineFirework = function(options){
	var me = this;
	
	apply(me, {
	
		size: 2,

		x: 0,
		y: 0,

		velX: 0,
		velY: 0,
		variance: 0,

		duration: 25,
		skip: 0,

		isFading: false,		
		isComplete: false, 

		colors: ['rgba(255,43,41,1)', 'rgba(255,129,124,1)', 'rgba(255,213,208,1)', 'rgba(250,254,254,1)', 'rgba(214,254,254,1)', 'rgba(163,244,254,1)', 'rgba(107,223,254,1)', 'rgba(55,200,254,1)', 'rgba(17,182,254,1)', 'rgba(2,174,254,1)', 'rgba(76,203,254,1)', 'rgba(206,245,254,1)', 'rgba(253,244,244,1)', 'rgba(253,207,214,1)', 'rgba(253,158,177,1)', 'rgba(247,115,140,1)', 'rgba(248,89,112,1)', 'rgba(249,59,77,1)', 'rgba(251,30,43,1)', 'rgba(253,8,15,1)', 'rgba(254,0,0,1)', 'rgba(255,7,6,1)', 'rgba(255,79,78,1)', 'rgba(253,179,178,1)'],

		locations: [],

		update: function(context) {
			if (me.isComplete) {
				return;
			}

			// Artificially slow it down			
			me.skip++;
			if (me.skip < 1) {
				me.doUpdate = false;
				return;
			}			
			me.skip = 0;
			me.doUpdate = true;

			if (context.accelX) {
				me.velX += context.accelX;
			}
			if (context.accelY) {
				me.velY += context.accelY - (me.velY < 0 ? 0 : context.accelY/2);
			}
			
			me.velX += -(me.velX/20);
			me.velY *= 0.96;

			if (me.locations.length < me.duration) {
				me.x += me.velX;
				me.y += me.velY;			

				var color =  me.colors[Math.floor((me.locations.length / me.duration) * me.colors.length)];
				me.locations.push({x:me.x+ (me.variance > 0 ? (me.variance*2)*Math.random()-me.variance : 0), y:me.y+ (me.variance > 0 ? (me.variance*2)*Math.random()-me.variance : 0), color: color});
				
			} else {
				me.isComplete = true;
			}
		},
		
		draw: function(canvasContext) {
			if (me.locations.length < 2 || me.isComplete || !me.doUpdate) {
				return;
			}

			var oldComposite = canvasContext.globalCompositeOperation;
			canvasContext.lineCap = 'round';
			canvasContext.globalCompositeOperation = 'source-over';
			var l1 = me.locations[me.locations.length - 1];
			var l2 = me.locations[me.locations.length - 2];
			
			canvasContext.strokeStyle = l1.color;
			canvasContext.lineWidth = me.size;
			canvasContext.beginPath();
			canvasContext.moveTo(l1.x+.5, l1.y);
			canvasContext.lineTo(l2.x+.5, l2.y);
			canvasContext.stroke();

		},
		
		
	});
	
	apply(me, options);
	
	me.locations.push({x:me.x, y:me.y, ttl:0});
}

ParticleGroup = function(options) {
	var me = this;
	options = options || {};
	
	apply(me, {
		
		life: 10,
		duration: 25,
		particles: [],
		
		// internal
		ttl: 0,
		
		update: function(context) {
			
			var isComplete = true;
			for (var i = 0; i < me.particles.length; i++) {
				me.particles[i].update(context);
				isComplete = isComplete && me.particles[i].isComplete;
			}
			me.isComplete = isComplete;
			if (me.isComplete && me.container) {
				me.container.removeChild(me.canvas);
			}

			me.ttl++;			
			if (me.ttl >= me.life) {
				
				me.canvas.style.opacity = 1-(me.ttl - me.life)/(me.duration - me.life)*1;
			};
		},
		
		draw: function(canvasContext) {
			canvasContext = me.canvasContext || canvasContext;
			for (var i = 0; i < me.particles.length; i++) {
				me.particles[i].draw(canvasContext);
			}
		},
		
		add: function(particle) {
			me.particles.push(particle);
		},
		
		attach: function(container) {
			me.canvas = document.createElement('canvas');
			me.canvas.style.position = 'absolute';
			me.canvas.style.left = '0px';
			me.canvas.style.top = '0px';
			me.canvas.width = container.clientWidth;
			me.canvas.height = container.clientHeight;

			container.appendChild(me.canvas);
			me.canvasContext = me.canvas.getContext('2d');						
			me.container = container;
		}
	});	
	
	apply(me, options);
};

