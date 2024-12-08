
cupid = new DivSprite({
	imgDir: ROOT_DIR + '/img/cupid',
	scale: 1,
	state: 'start',
	renderTo: 'swakker-container',
	offsetX: 40,
	animMap: {
	
		flyRight: {
			imgName: 'FlyRight',
			frameCount: 5,
			loop: true,
			delay: 150,
			offsetY: 7,
			offsetX: 7
		},
		
		flyLeft: {
			imgName: 'FlyLeft',
			frameCount: 5,
			loop: true,
			delay: 150,
			offsetX: -40,
			offsetY: 6
		},
		
		flyToIdle: {
			imgName: 'FlyToIdle',
			frameCount: 5,
			delay: 150,
			offsetY: 3
		},
		
		idle: {
			imgName: 'Idle',
			frameCount: 6,
			loop: true,
			delay: 150
		},
		
		idleToFly: {
			imgName: 'IdleToFly',
			frameCount: 3,
			delay: 150,
			offsetX: -40,
			offsetY: 4
		},
		
		shoot: {
			imgName: 'Shoot',
			frameCount: 6,
			delay: 150,
			offsetX: -10,
			offsetY: 3
		},
		
		shootEnd: {
			imgName: 'ShootEnd',
			frameCount: 5,
			delay: 150,
			offsetX: -5,
			offsetY: 1
		},
		
		turnLeft: {
			imgName: 'TurnLeft',
			frameCount: 5,
			delay: 150,
			offsetY: 6,
			offsetX: -15
		},
		
		turnRight: {
			imgName: 'TurnRight',
			frameCount: 5,
			delay: 150,
			offsetY: 6,
			offsetX: -15
		}
	},
	
	callback: function(event) {

		// Finished flying onto screen
		if (event.action == 'moveTo' && this.state == 'start') {
			this.vehicleIdx = 0;	
			this.setAnimation('flyToIdle');			
			this.state = 'shooting';
		}
		if (event.action == 'moveTo' && this.state == 'wait') {
			this.setAnimation('turnRight');
		}
		if (event.action == 'moveTo' && this.state == 'leaving') {
			this.swakker.showReplayButton();
		}

		// Wait
		if (event.animation && event.animation.id === 'turnRight') {
			this.setAnimation('idle');
		}
		
		// Fire!
		if (event.animation && event.animation.id === 'flyToIdle') {
			this.setAnimation('shoot');
			this.swakker.playSFX(ROOT_DIR + '/img/cupid/twang.wav');
		}

		if (event.animation && event.animation.id === 'shoot') {
			this.setAnimation('shootEnd');
			this.swakker.startVehicle(this.vehicleIdx++);
		}
		if (event.animation && event.animation.id === 'shootEnd') {
			this.setAnimation('idle');

			// Move to next arrow origin
			if (this.vehicleIdx < data.message.smoke.vehicles.length) {
				var point = data.message.smoke.vehicles[this.vehicleIdx].array[0].v;
				this.moveTo(point[0], point[1], 2000);
			}
			
			// Move to a wait location
			if (this.vehicleIdx == data.message.smoke.vehicles.length) {
				this.state = 'wait';
				this.setAnimation('turnLeft');
			}
		}
		
		// Done with all arrows
		if (event.animation && event.animation.id === 'turnLeft') {
			this.setAnimation('flyLeft');

			if (this.state == 'wait') {
				this.moveTo(50, this.y, 2000);
			} else {
				this.moveTo(-300, this.y, 2000);
			}
		}
	}		
});	

function startCupid(swakker) {

	var point = data.message.smoke.vehicles[0].array[0].v;
	cupid.swakker = swakker;	
	cupid.state = 'start';
	cupid.screenScale = swakker.screenScale;
	cupid.setPosition(-300, point[1]);
	cupid.setAnimation('flyRight');
	cupid.show();
	cupid.moveTo(point[0], cupid.y);
	cupid.vehicleIdx = 0;
	
}

function start() {
	if (!window.cupidSwakker) {
		window.cupidSwakker = new Swakker({
			imgDir: 'img/cupid',
			imgName: 'arrow',
			imgStep: 10,
			imgMirror: true,
			frameDelay: 10,
			smokeGrowthspan: 10,
			smokeFadeAfterComplete: true,
			renderTo: 'swakker',
			data: data,
			spriteSizeRatio: 1.25,
			smokeUpdateType: 'twinkle',
			callback: function(obj){
				if (obj.vehicle < window.cupidSwakker.data.message.smoke.vehicles.length - 1) {
					cupid.setAnimation('shoot');
				}
				else {
					cupid.state = 'leaving';
					cupid.setAnimation('turnLeft');
				}
			},
			onReady: function() {
				startCupid(window.cupidSwakker);
			}
		});
		window.cupidSwakker.render();
	} else {
		window.cupidSwakker.reset();
	}
}