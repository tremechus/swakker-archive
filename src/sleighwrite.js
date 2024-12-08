

function start() {
	var frame = 1;
	if (!window.planeSwakker) {
		window.planeSwakker = new Swakker({
			imgDir: 'img/sleigh',
			imgName: ['sleigh', 'reindeer_1', 'reindeer_2', 'reindeer_3', 'reindeer_4'], 
			imgStep: 10,
			frameDelay: 10,
			connectVehicles: true,
			renderTo: 'swakker',
			data: data,
			spriteSizeRatio: 1.5,
			
			smokeFadeAfterComplete: true,
			callback: function(obj){
				if (obj.vehicle < data.message.smoke.vehicles.length - 1) {
					window.planeSwakker.startVehicle(obj.vehicle + 1);
				} else {
					window.planeSwakker.showReplayButton();
				}
			},
			onReady: function() {
				var vehicles = [];
				vehicles.push(window.planeSwakker.startVehicle(0, {
					imgName: 'reindeer_1',
					smoke: false
				}));
				vehicles.push(window.planeSwakker.startVehicle(0, {
					imgName: 'reindeer_1',
					smoke: false
				}));
				vehicles.push(window.planeSwakker.startVehicle(0, {
					imgName: 'reindeer_1',
					smoke: false
				}));
				window.planeSwakker.startVehicle(0, {
					imgName: 'sleigh'
				});
				var distance = 12;
				for (var i = 0; i < vehicles.length; i++) {
					vehicles[i].idx = (vehicles.length * distance) - (distance * i);
				}
				setInterval(function(){
				
					for (var i = 0; i < vehicles.length; i++) {
						var vehicle = vehicles[i];
						vehicle.imgName = 'reindeer_' + frame;
						
						frame++;
						if (frame == 5) {
							frame = 1;
						}
					}
					
				}, 100);
			}
		});
		window.planeSwakker.render();
	} else {
		window.planeSwakker.reset();
	}
}
