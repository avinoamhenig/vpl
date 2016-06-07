export default (...paramNames) => (...args) => {
	let obj = {};
	for (let i = 0; i < args.length; i++) {
		obj[paramNames[i]] = args[i];
	}
	return obj;
};
