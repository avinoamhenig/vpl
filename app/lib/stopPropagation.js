export default (f, ...args) => e => {
	e.stopPropagation();
	f(...args);
}
