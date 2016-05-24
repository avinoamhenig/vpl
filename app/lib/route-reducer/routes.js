import Path from 'path-parser'

const routes = (...routes) => routes;
const route = (path, key, ...subroutes) => ({
	path: new Path(path),
	key,
	subroutes: routes(...subroutes)
});
const redirect = (oldPath, newPath) => {}; // TODO redirect route

export { routes, route, redirect }
