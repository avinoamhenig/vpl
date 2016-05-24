let f = (name, component) => {
	if (component === undefined) {
		return component => f(name, component);
	}
	component.displayName = name;
	return component;
};

export default f;
