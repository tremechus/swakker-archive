////
// SWAKKER
//
// Call init({}) with these options
//
//		NAME			REQ	DESCRIPTION
//		imgDir			Y	Relative directory where images are stored
//		imgName			Y	Prefix to image names (e.g. 'plane' would resolve to 'plane_0.png'		
//		imgStep			Y	Degree increment of images
//		imgMirror		N	If true will use degrees 0..180 for 180..360
//		callback		N	Function that will be called when a vehicle finishes
//		data			Y	JSON data from the server
//		renderTo		Y	id of DIV in which to embed

SWAKKER_VERSION = '2.0.2';

ROOT_DIR = ".";

mobileDefaults = {
	smokeGrowthspan: 0,
	smokeFadeDuration: 0,
	smokeAnimCount: 3
//	vehicleUpdateCount: 6,
//	smokeDensity: .75	
};

// Global setup	
Swakker = function(options) {
	var me = this;

	apply(me, {
		referenceWidth: 1024,
		smokeGrowthspan: 50,
		smokeFadespan: 20,
		minSmokePercent: .8,
		vehicleUpdateCount: 1, // number of frames to skip per vehice update
		smokeGrowthSkipCount: 3, // number of updates between smoke updates (bigger number=>better performance, smaller number=>smoother updates)
		smokeFadeDuration: navigator.userAgent.match(/IE/) ? 0 : 4000, 
		frameDelay: 50, // Milliseconds between frame updates
		smokeFrameDelay: 100, // milliseconds between smoke updates
		callback: null,
		imgMirror: false,
		smokeDensity: 1, // The percentage of placing a smoke at a designation location (a value of 1 places all smoke)
		smokeUpdateType: 'fade', // fade or twinkle
		smokeFadeAfterComplete: false,
		smokeMaxSize: 30,
		spriteSizeRatio: 1,
		particles: [],
		showReplayOnFinish: false,
		spritesFinished: true,
		connectVehicles: false,
		smokeAnimCount: 15,
		
		// Internal
		activeSmoke: {},
		activeSmokeFrames: [],
		activeSmokeLength: 0,
		idx: 0,
		lastBounds: {x:0, y:0, width:0, height:0, angle:0},
		planeFinished: false,
		smokeFinished: false,
		smokeGrowthIndex: 0,
		smokeFadeIndex: 0,
		intervalHandler: null,
		smokeIntervalHandler: null,
		images: {},
		smokeImage: null,
		defaultSmokeImage: null,
		smokeGrowthTable: [],
		smokeFadeTable: [],
		dataProcessed: false,
		imageLoadingCount: 0,
		imagesRequested: {},
		fadeStart: 0,
		firstSmokeTime: 0,
		embedCount: 1,
		idx: 0, // general world time counter
		smokeCanvasList: [],
		
		vehicles: [],

		render: function() {
			me.container = document.getElementById(me.renderTo);			
			
			me.width = me.container.clientWidth;
			me.height = me.container.clientHeight;
			
			me.dom = document.createElement('div');
			me.dom.id = 'swakker-container';
			me.dom.style.width = '100%';
			me.dom.style.height = '100%';
			me.dom.style.backgroundColor = '#07d';
			me.dom.style.position = 'relative';
			me.dom.style.overflow = 'hidden';

			// Original data in file no longer available, hard wire to local			
			// var background = me._createImage(me.data.message.backgroundImage.image);
			var background = me._createImage("img/background.png");
			background.style.width = '100%';
			background.style.height = '100%';
			background.style.position = 'absolute';
			background.style.left = '0px';
			background.style.top = '0px';
			

			// Canvas
			me.canvas = document.createElement('canvas');
			me.canvas.width = me.width;
			me.canvas.height = me.height;
			me.canvas.style.width = me.width +'px';
			me.canvas.style.height = me.height + 'px';
			me.canvas.style.position = 'absolute';
			me.canvas.style.zIndex = 3000;
			me.canvasContext = me.canvas.getContext('2d');

			me.smokeCanvas = document.createElement('canvas');
			me.smokeCanvas.width = me.width;
			me.smokeCanvas.height = me.height;
			me.smokeCanvas.style.width = me.width +'px';
			me.smokeCanvas.style.height = me.height + 'px';
			me.smokeCanvas.style.position = 'absolute';
			me.smokeCanvas.style.zIndex = 2999;
			me.smokeCanvasContext = me.smokeCanvas.getContext('2d');

			me.dom.appendChild(background);
			me.dom.appendChild(me.canvas);
			me.dom.appendChild(me.smokeCanvas);

			me.container.appendChild(me.dom);


			me.updateSmoke = function(){}; 
//				(me.smokeUpdateType == 'fade' && me._fadeSmoke) ||
//				(me.smokeUpdateType == 'twinkle' && me._twinkleSmoke);
			
			// We can now process our data as we now have our dimensions
			me.processData();
			
			me.replayButton = document.createElement('div');
			me.replayButton.style.position = 'absolute';
			me.replayButton.style.bottom = '3px';
			me.replayButton.style.left = '3px';
			me.replayButton.style.width = (64 * me.screenScale) + 'px';
			me.replayButton.style.height = (64 * me.screenScale) + 'px';
			me.replayButton.style.display = 'none';
			me.replayButton.style.zIndex = 5000;
			me.replayButton.onclick = function() {
				me.replayButton.style.display = 'none';
				start();
			}
			
			var replayImg = document.createElement('img');
			replayImg.src = ROOT_DIR + '/img/reload.png';
			replayImg.style.width = '100%';
			replayImg.style.height = '100%';
			replayImg.style.position = 'absolute';
			replayImg.style.left = '0px';
			replayImg.style.top = '0px';
			me.replayButton.appendChild(replayImg);

			me.dom.appendChild(me.replayButton);
		},
				
		showReplayButton: function() {
			me.replayButton.style.display = 'block';
		},
		
		playBM: function(url) {
			me.playSound('bm', url);
		},
		
		playSFX: function(url) {
			me.playSound('sfx', url);
		},
		
		playSound: function(what, url) {
			var bm = document.getElementById(what); 
			var id = 'sfx' + (me.embedCount++);

			bm.innerHTML = "<embed src='"+url+"' hidden=true width='0px' height='0px' loop=false autoplay=true type='audio/mpeg' id='" + id + "'>";



//			var sfx = document.getElementById(id);
//			if (sfx.Start) {
//				sfx.Start();
//			} else if (sfx.Play) {
//				sfx.Play();
//			} else {
//				console.log("Don't know how to play sound");
//			}
		},
				
		processData: function() {

			me._layoutData();

			me.imgName = isArray(me.imgName) ? me.imgName : [me.imgName];
			var imageSteps = 360 / me.imgStep; 
			for (var v = 0; v < me.imgName.length; v++) {
				var name = me.imgName[v];
				var images = {};
				for (var r = 0; r < imageSteps; r++) {
					var rotation = r * me.imgStep;
					
					if (me.imgMirror && rotation > 180) {
						break;
					}
					
					images[rotation] = me._createImage(me.imgDir + '/' + name + '_' + rotation + '.png');
				}
				me.images[name] = images;
			}
						
			me.defaultSmokeImage = me._createImage(me.imgDir + '/smoke.png');
			
			// Lookup tables
			var step = (Math.PI / 2) / me.smokeGrowthspan;
			for (var i = 0; i < me.smokeGrowthspan; i++) {
				var size = Math.sin(i*step);
				
				me.smokeGrowthTable.push({
					origWidth: size * me.maxSmokeSize,
					origHeight: size * me.maxSmokeSize
				});				
			}
			
			step = .75 / me.smokeFadespan;
			for (var i = 0; i < me.smokeFadespan; i++) {
		 		me.smokeFadeTable[i] = 1 - (i * step);
			}	
		
			
			me.dataProcessed = true;
		},

		_createImage: function(src) {
			var me = this;
			var image = new Image();

			image.src = src.indexOf("http://") == 0 ? src : ROOT_DIR + "/" + src;
			if (!me.imagesRequested[src]) {
				image.onload = delegate(me._imageLoaded, me, src);
				image.onerror = delegate(me._imageLoaded, me, src);
				me.imageLoadingCount++;
				me.imagesRequested[src]=true;
			}

			return image;
		},

		_imageLoaded: function(src) {
			if (!this.imagesRequested[src]) {
				// Already handled
				return;
			}
			this.imageLoadingCount--;
			delete this.imagesRequested[src];
			
			if (this.imageLoadingCount == 0) {
				this.onPreReady();
				this.onReady();
			}
		},
		
		onPreReady: function() {
		},
		
		onReady: function() {
		},
		
		reset: function() {

			// Internal state
			apply(me, {
				vehicles: [],
				activeSmoke: [],
				activeSmokeFrames: [],
				lastBounds: {x:0, y:0, width:0, height:0, angle:0},
				smokeFinished: false,
				smokeGrowthIndex: 0,
				smokeFadeIndex: 0
			});

			// Hide smoke
			for (var i = 0; i < me.smokeCanvasList.length; i++) {
				var img = me.smokeCanvasList[i];
				var ctxt = img.getContext("2d");
				ctxt.clearRect(0, 0, img.width, img.height);
			}
			me.smokeCanvasContext.clearRect(0, 0, me.width, me.height);
			
			this.initSfx();
			this.onReady();
		},
		
		samePosition: function(p1, p2) {
			return p1 && p2 && p1.v[0] == p2.v[0] && p1.v[1] == p2.v[1];
		},
		
		startVehicle: function(vehicleIdx, config){
		
			var vehicle = apply({
				vehicle: vehicleIdx,
				idx: 0,
				finished: false,
				points: data.message.smoke.vehicles[vehicleIdx].array,
				imgName: me.imgName[0],
				smoke: true
			}, config);

			me.vehicles.push(vehicle);
			
			if (!me.intervalHandler) {
				me.intervalHandler = setInterval(function(){
					me.draw();
				}, me.frameDelay);
			}

			if (!me.smokeIntervalHandler) {
				me.smokeIntervalHandler = setInterval(function() {
					me._animateSmoke();
				}, me.smokeFrameDelay);
			}
			
			return vehicle;
		},
		
		_layoutData: function() {
			var me = this;
			
			var oldWidth = me.width;
			me.width = me.container.clientWidth;
			
			var oldHeight = me.height;
			me.height = me.container.clientHeight; 
			
			me.hpadding = Math.floor(me.width * 0.05);
			me.vpadding = Math.floor(me.height * 0.05);
			me.screenScale = me.width / me.referenceWidth;
			me.maxSmokeSize = me.smokeMaxSize * me.screenScale;
			
			minX = 0;
			minY = 0;
			maxX = 0;
			maxY = 0;
		
			for (var veh = 0; veh < data.message.smoke.vehicles.length; veh++) {

				var vehicle = data.message.smoke.vehicles[veh];
				var points = vehicle.array;

				for (var i = 0, lim = points.length; i < lim; i++) {
				
					var point = points[i];
					var position = point.v;
		
					// Find extents
					if (point.o) {
						
						// Global Extents
						if (position[0] < minX) 
							minX = position[0];
						if (position[0] > maxX) 
							maxX = position[0];
						if (position[1] < minY) 
							minY = position[1];
						if (position[1] > maxY) 
							maxY = position[1];
					}
					
				}
				
			}

			// Constrain to screen size
			var width, height;
			var dimX = maxX - minX;
			var dimY = maxY - minY;
			var swakRatio = dimY / dimX;
			
			width = me.width - (me.hpadding*2);
			height = width * swakRatio;
			
			if (height > me.height) {
				height = me.height - (me.vpadding*2);
				width = height / swakRatio;
			}

			var scale = width / dimX;

			var centerX = me.width/2;
			var centerY = me.height/2;

			var isSmokeTrail = false;
			var img;
			var imgList;
			var currentSmokeImage;
			me.smokeCanvasList = [];
			for (var veh = 0; veh < data.message.smoke.vehicles.length; veh++) {
			
				var vehicle = data.message.smoke.vehicles[veh];
				var points = vehicle.array;
				
				var localMinX = 20000000;
				var localMinY = 20000000;
				var localMaxX = -20000000;
				var localMaxY = -20000000;

				for (var i = 0, lim = points.length; i < lim; i++) {
				
					var point = points[i];
					var facing = point.f;
					var up = point.u;

					// Normalize to screen coords
					point.v[0] = centerX + point.v[0]*scale;
					point.v[1] = centerY - point.v[1]*scale;

					// orientation
					point.f = Math.atan2(-facing[1], facing[0]);
					
					var up = Math.round((Math.atan2(-facing[1], facing[0]) / Math.PI) * 180);
					var rotation = Math.round(up / me.imgStep) * me.imgStep;
					rotation = rotation < 0 ? rotation + 360 : rotation;
					if (me.imgMirror && rotation > 180) {
						rotation -= 180;
					}
					point.u = rotation;
	
					// Vehicle Extents
					if (position[0] < localMinX) 
						localMinX = point.v[0];
					if (position[0] > localMaxX) 
						localMaxX = point.v[0];
					if (position[1] < localMinY) 
						localMinY = point.v[1];
					if (position[1] > localMaxY) 
						localMaxY = point.v[1];
					
					// Smoke				
					var sminX;
					var sminY;
					var smaxX;
					var smaxY;
					if (point.c) {
						// Preload our smoke
						var color = point.c.substring(1); // kill leading #
						currentSmokeImage = me._createImage(me.imgDir + '/smoke_' + color + '.png');
					}
						
					if (point.o && i < points.length-1) {
						
						// Staring new trail?
						if (!isSmokeTrail) {
							isSmokeTrail = true;
							smokeStartPoint = point;
							
							sminX = 200000000;
							sminY = 200000000;
							smaxX = -200000000;
							smaxY = -200000000;
							
							imgList = [];
							point.smokeStart = true;
						}
						
//						var r = Math.random();
//						if (r > me.smokeDensity) {
//							continue;
//						}

						// Configuration						
						point.img = imgList;
						point.smokeScale = 1;// - Math.random() * me.minSmokePercent;
						point.smokeX = point.v[0] + (Math.random()*4 - 2);
						point.smokeY = point.v[1] + (Math.random()*4 - 2);
						point.smokeImages = me.smokeGrowthTable;
						point.smokeImage = currentSmokeImage;
						point.smokeRotation = Math.random()*360;
						point.smokeAlpha = 0.5 + Math.random()*0.5;
												
						// Extents
						var tlx = point.v[0] - me.maxSmokeSize / 2 - 4;
						var tly = point.v[1] - me.maxSmokeSize / 2 - 4;
						var brx = point.v[0] + me.maxSmokeSize / 2 + 4;
						var bry = point.v[1] + me.maxSmokeSize / 2 + 4;
						
						if (tlx < sminX) {
							sminX = tlx;
						}
						if (tly < sminY) {
							sminY = tly;
						}
						if (brx > smaxX) {
							smaxX = brx;
						}
						if (bry > smaxY) {
							smaxY = bry;
						}
												
					} else if (isSmokeTrail) {
						isSmokeTrail = false;

						point = points[i-1];
						point.img = imgList;
						point.smokeEnd = true;

						// Done with trail
						for (var j = 0; j < me.smokeAnimCount; j++) {
							var img = document.createElement('canvas');
							img.width = smaxX - sminX;
							img.height = smaxY - sminY;
							img.style.position = 'absolute';
							img.style.top = sminY + 'px';
							img.style.left = sminX + 'px';
							img.style.display = 'none';
							img.x = sminX;
							img.y = sminY;
							document.getElementById('swakker-container').appendChild(img);
							me.smokeCanvasList.push(img);
							imgList.push(img);
//						ctxt.fillStyle = '#f00';
//						ctxt.fillRect(0, 0, img.width, img.height);
						}
					}
				}

				vehicle.minX = localMinX;
				vehicle.minY = localMinY;
				vehicle.maxX = localMaxX;
				vehicle.maxY = localMaxY;
			}
		},
		
		draw: function() {
			var me = this;
			var canvasContext = me.canvasContext;
			var activeSmoke = me.activeSmoke;
			var screenScale = me.screenScale;
			
			if (me.container.clientWidth != me.width) {
				// Container size has changed
				me._layoutData();		
				canvasContext.clearRect(0, 0, me.width, me.height);
			}

			////
			// Particles
			me.particlesFinished = true;
			
			//draw
			var needsCleanup = false;
			for (var i = 0, lim = me.particles.length; i < lim; i++) {
				var p = me.particles[i];
				p.update({
					accelY: .2 // Gravity
				});
				p.draw(canvasContext);

				if (p.isComplete) {
					needsCleanup = true;
				}				
				
				me.particlesFinished = me.particlesFinished && p.isComplete;
			}
			
			//cleanup
			if (needsCleanup) {
				var newList = [];
				for (var i = 0, lim = me.particles.length; i < lim; i++) {
					var particle = me.particles[i];
					if (!particle.isComplete) {
						newList.push(particle);
					}
				}
				me.particles = newList;
			}
			
			////
			// Vehicles
			for (var i = 0; i < me.vehicles.length; i++) {
				var vehicle = me.vehicles[i];
				var idx = vehicle.idx;
				var points = vehicle.points;
				var lastBounds = vehicle.lastBounds;
				
				if (!lastBounds) {
					vehicle.lastBounds = lastBounds = {};
				}
				
				vehicle.drawVehicle = me.smokeGrowthspan >= 0; 
				
				// Kill the old vehicle
				if (vehicle.drawVehicle) {
					canvasContext.save();
					canvasContext.translate(lastBounds.x, lastBounds.y);
					canvasContext.scale(screenScale * me.spriteSizeRatio, screenScale * me.spriteSizeRatio);
					canvasContext.rotate(lastBounds.angle);
					canvasContext.clearRect(-lastBounds.width / 2 - 4, -lastBounds.height / 2 - 4, lastBounds.width + 8, lastBounds.height + 8);
					canvasContext.restore();
				}
			}
		
			// Connector?
			if (me.connectVehicles) {
				
				canvasContext.beginPath();
				canvasContext.moveTo(me.vehicles[0].lastBounds.x, me.vehicles[0].lastBounds.y);
				for (var vehIdx = 1; vehIdx < me.vehicles.length; vehIdx++) {
					canvasContext.lineTo(me.vehicles[vehIdx].lastBounds.x, me.vehicles[vehIdx].lastBounds.y);
				}
				canvasContext.strokeStyle = '#8B4513';
				canvasContext.lineWidth = 2;
				canvasContext.stroke();
			}
		
			me.allVehiclesFinished = true;
			for (var i = 0; i < me.vehicles.length; i++) {
				var vehicle = me.vehicles[i];
				var idx = vehicle.idx;
				var points = vehicle.points;
				var lastBounds = vehicle.lastBounds;
				if (idx < points.length) {
					var point = points[idx];
					var position = point.v
					
					var facing = point.f;
					var up = point.u;

					if (vehicle.drawVehicle) {

						canvasContext.save();
						
						canvasContext.translate(position[0], position[1]);
						canvasContext.scale(screenScale * me.spriteSizeRatio, screenScale * me.spriteSizeRatio);
						
						var image = me.images[vehicle.imgName][up];
						
						canvasContext.rotate(facing);
						canvasContext.drawImage(image, -image.width / 2, -image.height / 2);
						lastBounds.x = position[0];
						lastBounds.y = position[1];
						lastBounds.width = image.width;
						lastBounds.height = image.height;
						lastBounds.angle = facing;
						
						canvasContext.restore();
					}

					// Special case insta-show vehicle
					if (me.smokeGrowthspan < 0) {
						while (vehicle.idx < points.length) {
							if (points[vehicle.idx].smokeImages) {
								me._activateSmoke(points, vehicle.idx);
							}
							vehicle.idx++;
						}
						continue;
					}
					
					if (vehicle.smoke && points[idx].smokeImages) {
						me._activateSmoke(points, idx);
					}
					
					// No more points, use the last two points to direction the speed, attitude, and direction
					// of the plane until it goes off the screen
					if (idx == points.length - 1) {
						vehicle.finalFacing = facing;
						vehicle.finalUp = up;
						vehicle.finalX = position[0];
						vehicle.finalY = position[1];
						
						// Avoid duplicate points otherwise the plane won't have a correct velocity			
						var previousPoint;
						for (var prevIdx = me.vehicleUpdateCount; prevIdx < points.length; prevIdx+=me.vehicleUpdateCount) {
							previousPoint = points[idx - prevIdx];
							if (!me.samePosition(previousPoint, point)) {
								break;
							}
						}
						vehicle.finalSpeedX = position[0] - previousPoint.v[0];
						vehicle.finalSpeedY = position[1] - previousPoint.v[1];
					}
					
					me.allVehiclesFinished = false;
				}
				else if (!vehicle.planeFinished) {

					// We've run out of points to follow, now just fly off the screen
					if (vehicle.finalX + 100 > 0 && vehicle.finalX - 100 < me.width && vehicle.finalY + 100 > 0 && vehicle.finalY - 100 < me.height) {
						vehicle.finalX += vehicle.finalSpeedX;
						vehicle.finalY += vehicle.finalSpeedY;
						
						var image = me.images[vehicle.imgName][vehicle.finalUp];
						
						canvasContext.save();
						canvasContext.translate(vehicle.finalX, vehicle.finalY);
						canvasContext.scale(me.screenScale * me.spriteSizeRatio, me.screenScale * me.spriteSizeRatio);
						canvasContext.rotate(vehicle.finalFacing);
						canvasContext.drawImage(image, -image.width / 2, -image.height / 2);
						canvasContext.restore();
						
						lastBounds.x = vehicle.finalX;
						lastBounds.y = vehicle.finalY;
						
						me.allVehiclesFinished = false;
					} else {
						vehicle.planeFinished = true;
						
						if (me.callback) {
							me.callback(vehicle);
						}
					}
				}
				
				vehicle.idx += me.vehicleUpdateCount;
			}
			
			me._updateSmoke();
			if (me.allVehiclesFinished && me.smokeFinished && me.particlesFinished) {
 
				// The End.
				clearInterval(me.intervalHandler);
				me.intervalHandler = null;
				
				if (me.showReplayOnFinish) {
					me.showReplayButton();
				}
				
			}
			me.idx++;
		},
		
		_activateSmoke: function(points, idx) {
			this.activeSmoke[idx] = {
				point: points[idx],
				idx: idx,
				step: 0
			};
			
			this.activeSmokeLength++;
		},	

		_updateSmoke: function() {
			var me = this;

			if (me.activeSmokeLength == 0) {
				return;
			}

			// Clear out existing smoke
			var minx = me.width;
			var miny = me.height;
			var maxx = 0;
			var maxy = 0;
			var canvas = me.smokeCanvasContext;
			for (var smokeKey in me.activeSmoke) {
				var smoke = me.activeSmoke[smokeKey];
				var point = smoke.point;
				var img = point.smokeImages[smoke.step];
				if (!img) continue;

				if (point.left < minx) {
					minx = point.left;
				}				
				if (point.left + point.width> maxx) {
					maxx = point.left + point.width;
				}
				if (point.top < miny) {
					miny = point.top
				}
				if (point.top + point.height > maxy) {
					maxy = point.top + point.height;
				}
			}
			var clearWidth = maxx - minx;
			var clearHeight = maxy - miny;
			if (clearWidth > 0 && clearHeight > 0) {
			
				canvas.save();
				canvas.clearRect(minx, miny, maxx - minx, maxy - miny);
				canvas.restore();
			}

			var finished = true;			
			for (var smokeKey in me.activeSmoke) {
				finished = false;
				var smoke = me.activeSmoke[smokeKey];
				
				var point = smoke.point;
				if (smoke.step < me.smokeGrowthspan) {
					var img = point.smokeImages[smoke.step];

					// Now set the source since we can check whether the smoke image exists
					img.src = point.smokeImage;
					if (img.src.width <= 0) {
						img.src = me.defaultSmokeImage;
					}

					// Grow smoke
					point.width = img.origWidth * point.smokeScale;
					point.height = img.origHeight * point.smokeScale;
					point.left = (point.smokeX - point.width / 2);
					point.top = (point.smokeY - point.height / 2);
					point.opacity = point.smokeAlpha;

					// Draw smoke					
					canvas.save();
					canvas.translate(point.left + point.width/2, point.top + point.height/2);
					canvas.rotate(point.smokeRotation);
					canvas.drawImage(img.src, -point.width/2, -point.height/2, point.width, point.height);
					canvas.restore();
				} else {
					// Crystalize smoke					
					if (point.o && point.img) {
						var img = point.img[0];
						var size = point.smokeScale * me.maxSmokeSize;
						var x = point.smokeX - img.x;
						var y = point.smokeY - img.y;
	
						img = point.smokeImages[smoke.step-1] || {};
						img.src = point.smokeImage;
						if (img.src.width <= 0) {
							img.src = me.defaultSmokeImage;
						}
						
						var imgList = point.img;
						for (var i = 0; i < imgList.length; i++) {
							var direction = Math.random() < .5 ? -1 : 1;
							var ctxt = imgList[i].getContext("2d");
							ctxt.globalAlpha = point.alpha;
							ctxt.save();
							ctxt.translate(x, y);
							var r = point.smokeRotation + 360/me.smokeAnimCount * i * direction;
							ctxt.rotate(r);
							ctxt.drawImage(img.src, -size / 2, -size / 2, size, size);
							ctxt.restore();
							ctxt.globalAlpha = 1;
							
						}
							// Show now
						imgList[0].style.display = 'none';
						imgList[0].style.display = 'block';
						
						me.activeSmokeLength --;
						
						if (point.smokeStart) {
							me.activeSmokeFrames.push(imgList);
							imgList.active = 0;
						}
						if (point.smokeEnd) {
							imgList.birth = new Date().getTime();
						}
					}
					
					delete me.activeSmoke[smoke.idx];
				}
				
				smoke.step++;
			}

			me.smokeFinished = me.allVehiclesFinished && finished;
		},
		
		_animationOffset: 0,
		_animateSmoke: function() {
			var now = new Date().getTime();
			for (var i = 0; i < me.activeSmokeFrames.length; i++) {
				var imgList = me.activeSmokeFrames[i];

				// Page flipping
				if (((i+me._animationOffset) % 2) != 0) {
					continue;
				}
				imgList[imgList.active].style.display = 'none';
				imgList.active = (imgList.active + 1) % imgList.length;
				imgList[imgList.active].style.display = 'block';
				
//				var timer = now - imgList.birth;
//				if (timer > 1000) {
//					imgList[imgList.active].style.opacity = 1 - (timer/1000/10); 
//				}
			}
			me._animationOffset++;
		},
		
		initSfx: function() {
			if (data.message.sound.on) {
				if (data.message.sound.backgroundMusic.on) {
					var music = data.message.sound.backgroundMusic.playInRandomOrder ? 
							data.message.sound.backgroundMusic.url[Math.floor(data.message.sound.backgroundMusic.url.length * Math.random())]
							:
							data.message.sound.backgroundMusic.url[0];
							;
					me.playBM(music);
				}
			}
		}
	});
	
	if (/android|ip(hone|od)/i.test(navigator.userAgent)) {
		apply(me, mobileDefaults);
	}	
	
	apply(me, options);

	me.initSfx();	
	
	return me;
};

function isArray(obj) {
	return obj.constructor.toString().indexOf('Array') != -1;
}
