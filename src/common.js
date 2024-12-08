function apply(obj, config) {
	for (p in config) {
		obj[p] = config[p];
	}
	return obj;
}

function delegate(func, scope, arg) {
	return function() {
		func.call(scope, arg);
	}
}
