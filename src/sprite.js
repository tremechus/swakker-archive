 
Sprite = function(id) {
	this.id = id;
	this.actions = [];				
	this.image = null;
	this.x = 0;
	this.y = 0;
	this.angle = 0;
	this.state = {};
}
Sprite.prototype.update = function() {
	this.lastX = this.x;
	this.lastY = this.y;
	this.lastAngle = this.angle;

	for (var i = 0, limit = this.actions.length; i < limit; i++) {
		if (!this.state[this.actions[i].id].isDone) {
			this.actions[i].update(this);
		}
	}
}
Sprite.prototype.draw = function(canvasContext){
	if (this.image) {
		canvasContext.save();
		canvasContext.translate(this.x, this.y);
		canvasContext.scale(screenScale, screenScale);
		canvasContext.rotate(this.angle);
				
		canvasContext.drawImage(this.image, -this.image.width/2, -this.image.height/2);
		this.lastX  = this.x;
		this.lastY = this.y;
		this.lastAngle = this.angle;
		
		canvasContext.restore();
	}
};
Sprite.prototype.clear = function(canvasContext) {
	if (this.image) {
		canvasContext.save();
		canvasContext.translate(this.x, this.y);
		canvasContext.scale(screenScale, screenScale);
		canvasContext.rotate(this.angle);
				
		canvasContext.clearRect(-this.image.width/2, -this.image.height/2, this.image.width, this.image.height);
		this.lastX  = this.x;
		this.lastY = this.y;
		this.lastAngle = this.angle;
		
		canvasContext.restore();
	}
};
Sprite.prototype.addAction = function(action) {
	this.actions.push(action);
	this.state[action.id] = {};
	action.start(this);
}

/////////////////////////////////////////
// ACTIONS

Action = {
	counter: 1
}

////
// TRANSLATE
TranslateAction = function(startX, startY, endX, endY, duration) {
	this.id = Action.counter++;
	this.startX = startX;
	this.startY = startY;
	this.endX = endX;
	this.endY = endY;
	this.duration = duration;
}
TranslateAction.prototype.start = function(sprite) {
	var state = {};
	sprite.state[this.id] = state;	

	state.start = new Date().getTime();	
	state.isDone = false;
}
TranslateAction.prototype.update = function(sprite) {
	var state = sprite.state[this.id];
	var now = new Date().getTime();
	var percent = (now - state.start)/this.duration;

	sprite.x = this.startX + (this.endX - this.startX) * percent;
	sprite.y = this.startY + (this.endY - this.startY) * percent;
	state.isDone = percent >= 1;
}

////
// ROTATE
RotateAction = function(startAngle, endAngle, duration) {
	this.id = Action.counter++;
	this.startAngle = startAngle;
	this.endAngle = endAngle;
	this.duration = duration;
}
RotateAction.prototype.start = function(sprite) {
	var state = {};
	sprite.state[this.id] = state;	

	state.start = new Date().getTime();
	state.isDone = false;
}
RotateAction.prototype.update = function(sprite) {
	var state = sprite.state[this.id];	
	var now = new Date().getTime();
	var percent = (now - state.start)/this.duration;
	
	sprite.angle = (this.endAngle - this.startAngle) * percent;
	state.isDone = percent >= 1;
}

////
// ANIMATE
AnimateAction = function(frames, duration) {
	this.id = Action.counter++;
	this.frames = frames;
	this.duration = duration;
}
AnimateAction.prototype.start = function(sprite) {
	var state = {};
	sprite.state[this.id] = state;	

	state.start = new Date().getTime();	
	state.isDone = false;
}
AnimateAction.prototype.update = function(sprite) {
	var state = sprite.state[this.id];
	var now = new Date().getTime();
	var percent = ((now - state.start)%this.duration)/this.duration;
	
	sprite.image = this.frames[~~(this.frames.length * percent)];
}

////
// FOLLOW PATH
FollowPathAction = function(points, speed) {
	this.id = Action.counter++;
	this.points = points;
	this.speed = speed;
}
FollowPathAction.prototype.start = function(sprite) {
	var state = {};
	sprite.state[this.id] = state;	

	state.index = 0;
	state.isDone = false;
}
FollowPathAction.prototype.update = function(sprite) {
	var state = sprite.state[this.id];
	var index = state.index;
	
	var destinationPoint = this.points[index];
	var x = sprite.x;
	var y = sprite.y;
	
	var distX = Math.abs(x - destinationPoint.x);
	var distY = Math.abs(y - destinationPoint.y);
	var distance = Math.sqrt(distX*distX + distY*distY);
	
	if (distance < this.speed) {
		sprite.x = destinationPoint.x;
		sprite.y = destinationPoint.y;
		
		index++;
		state.isDone = index == this.points.length;
		state.index = index;	
	}  else {
		
		var direction = Skywriter.getAngle({x:x, y:y}, destinationPoint);
		var dx = Math.cos(direction) * this.speed;
		var dy = -1 * Math.sin(direction) * this.speed;
		
		sprite.x += dx;
		sprite.y += dy;
		sprite.angle = direction
	}
}

////
// DELAY
DelayAction = function(duration, action) {
	this.id = Action.counter++;
	this.duration = duration;
	this.action = action;
}
DelayAction.prototype.start = function(sprite) {
	var state = {};
	sprite.state[this.id] = state;	

	state.start = new Date().getTime();	
	state.isDone = false;
}
DelayAction.prototype.update = function(sprite) {
	var state = sprite.state[this.id];	
	var now = new Date().getTime();

	if (now - state.start > this.duration) {
		if (this.action) {
			sprite.addAction(this.action);
		}
		state.isDone = true;
	}	
}

////
// MOVE TO
MoveToAction = function(x, y) {
	this.id = Action.counter++;
	this.x = x;
	this.y = y;
}
MoveToAction.prototype.start = function(sprite) {
	var state = {};
	sprite.state[this.id] = state;	

	state.isDone = false;
}
MoveToAction.prototype.update = function(sprite) {
	var state = sprite.state[this.id];	

	sprite.x = this.x;
	sprite.y = this.y;
	
	state.isDone = true;
}

////
// SCRIPT
ScriptAction = function(actions) {
	this.id = Action.counter++;
	this.actions = actions;
}
ScriptAction.prototype.start = function(sprite) {
	var state = {};
	sprite.state[this.id] = state;	

	state.index = 0;
	state.isDone = false;
}
ScriptAction.prototype.update = function(sprite) {
	var state = sprite.state[this.id];	
	var index = state.index;	
	
	if (!state.action) {
		state.action = this.actions[index];
		state.action.start(sprite);	
	}
	
	state.action.update(sprite);
	
	if (sprite.state[state.action.id].isDone) {
		index++;
		if (index == this.actions.length) {
			state.isDone = true;
			return;
		}
		state.index = index;
		state.action = null; // we'll pick up the next one on the next round		
	}
	
}	