const getChildPath = (path, parentRoute, partialMatch) => {
	const partialPath = parentRoute.path.build(partialMatch),
	      childPath = path.replace(new RegExp('^' + partialPath), '');
	return childPath;
};

const matchRoute = (route, path) => {
	if (route === null) return false;

	const match = route.path.match(path);
	if (match) return { key: route.key, params: match };

	const partialMatch = route.path.partialMatch(path);
	if (partialMatch) {
		if (matchOne(route.subroutes, getChildPath(path, route, partialMatch))) {
			return { key: route.key, params: partialMatch };
		}
	}

	return false;
};

const matchOne = (routes, path) => {
	for (const route of routes) {
		const match = matchRoute(route, path);
		if (match) return match;
	}
	return false;
};

const match = (routes, key, path) => {
	for (const route of routes) {
		if (route.key === key) {
			return matchRoute(route, path);
		}

		const partialMatch = route.path.partialMatch(path);
		if (partialMatch) {
			const childPath = getChildPath(path, route, partialMatch),
			      childMatch = match(route.subroutes, key, childPath);
			if (childMatch) return childMatch;
		}
	}
	return false;
};

export { match, matchOne };
