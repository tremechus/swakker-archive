

function start() {
	if (!window.planeSwakker) {
		window.planeSwakker = new Swakker({
			imgDir: 'img/shuttle',
			imgName: 'shuttle',
			imgStep: 10,
			frameDelay: 10,
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
				window.planeSwakker.startVehicle(0);	
			}
		});
		window.planeSwakker.render();
	} else {
		window.planeSwakker.reset();
	}
}
