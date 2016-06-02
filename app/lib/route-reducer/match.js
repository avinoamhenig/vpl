const getChildPath = (path, parentRoute, partialMatch) => {
	const partialPath = parentRoute.path.build(partialMatch),
	      childPath = path.replace(new RegExp('^' + partialPath), '');
	return childPath;
};

const matchRoute = (route, path) => {
	path = path.replace('%','--');
	if (route === null) return false;

	const match = route.path.match(path);
	if (match) {
		for (let key of Object.keys(match)) {
			match[key] = decodeURIComponent(
				match[key].replace('--', '%'));
		}
		return { key: route.key, params: match };
	}

	let partialMatch = route.path.partialMatch(path);
	if (partialMatch) {
		if (matchOne(route.subroutes, getChildPath(path, route, partialMatch))) {
			for (let key of Object.keys(partialMatch)) {
				partialMatch[key] = decodeURIComponent(
					partialMatch[key].replace('--', '%'));
			}
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

		let partialMatch = route.path.partialMatch(path);
		if (partialMatch) {
			const childPath = getChildPath(path, route, partialMatch),
			      childMatch = match(route.subroutes, key, childPath);
			if (childMatch) return childMatch;
		}
	}
	return false;
};

export { match, matchOne };
