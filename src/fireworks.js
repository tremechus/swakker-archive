
function newFirework(vehicleIdx){
	var firework = new DivSprite({
		imgDir: 'img/fireworks',
		scale: .5,
		state: 'shoot',
		renderTo: 'swakker-container',
		moveDelay: 50,
		animMap: {
		
			shoot: {
				imgName: 'flare',
				frameCount: 1,
				loop: true,
				delay: 0,
				offsetY: 32,
				offsetX: 32
			}
		
		
		},
		
		createParticle: function(angle, magnitude) {
			var vx = magnitude * Math.cos(angle);
			var vy = magnitude * Math.sin(angle);
			return new LineFirework({x:x, y:y, velX:vx, velY:vy, variance: .5});
		},
		
		callback: function(event){
			var me = this;
			
			if (event.action == 'moveTo' && this.state == 'shoot') {
			
				// Explode
				var particleGroup = new ParticleGroup();
				var segs = 10 + Math.floor(Math.random()*5);
				var inc = Math.PI*2/segs;
				var x = me.x-me.width, y = me.y-me.height;
				var magnitude = 3.5;
				var a = 0;
				for (var i = 0; i < segs; i++) {
					a += inc;
					particleGroup.add(me.createParticle(a + Math.random()*inc/2-inc/2, magnitude));
				}			
				for (var i = 0; i < segs; i++) {
					particleGroup.add(me.createParticle(Math.random() * Math.PI*2, Math.random()*(magnitude+1)));
					particleGroup.add(me.createParticle(Math.random() * Math.PI*2, Math.random()*(magnitude-1)));
				}
				
				particleGroup.attach(document.getElementById('swakker-container'));
				
				// Show message
				this.swakker.particles.push(particleGroup);
				this.swakker.startVehicle(this.vehicleIdx);
				this.hide();
			}
			
			
		}
	});
	
	firework.swakker = Fireworks.swakker;	

	var veh = firework.swakker.data.message.smoke.vehicles[vehicleIdx];
	var x = veh.minX + (veh.maxX - veh.minX)/2;
	var y = veh.minY + (veh.maxY - veh.minY)/2;	
	var w = firework.swakker.width/2;
		
	firework.state = 'shoot';
	firework.screenScale = firework.swakker.screenScale;
	firework.setPosition(firework.swakker.width/2, firework.swakker.height);
	firework.setAnimation('shoot');
	firework.show();
	firework.moveTo(x, y, 1000);
	firework.vehicleIdx = vehicleIdx;
	
	return firework;
}	

var Fireworks = {};

function startFireworks(swakker) {

	Fireworks.swakker = swakker;

	// Mix up the ordering of the vehicles
	var tmpVehicles = [];
	for (var i = 0; i < swakker.data.message.smoke.vehicles.length; i++) {
		tmpVehicles.push(i);
	}
	var vehicles = [];
	while (tmpVehicles.length > 0) {
		var idx = Math.floor(Math.random() * tmpVehicles.length);
		vehicles.push(tmpVehicles[idx]);
		tmpVehicles.splice(idx, 1); 
	}

	// Fire the off
	Fireworks.idx = 0;	
	var intervalHandler = setInterval(function() {
		var idx = vehicles[Fireworks.idx++]
		newFirework(idx);
		if (Fireworks.idx >= vehicles.length) {
			clearInterval(intervalHandler);
			swakker.spritesFinished = true;

		}		
	}, 500 + Math.random(2000));
	
}

function start() {
	if (!window.fireworksSwakker) {
		window.fireworksSwakker = new Swakker({
			imgDir: 'img/fireworks',
			imgName: 'flare',
			imgStep: 360,
			frameDelay: 50,
			smokeGrowthspan: -1,
			smokeFadeAfterComplete: true,
			renderTo: 'swakker',
			data: data,
			spriteSizeRatio: 1,
			showReplayOnFinish: true,
			spritesFinished: false,
			callback: function(obj){
			},
			onReady: function() {
				startFireworks(window.fireworksSwakker);
			}
		});
		window.fireworksSwakker.render();
	} else {
		window.fireworksSwakker.reset();
	}
}