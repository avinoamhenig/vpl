import { routes, route } from './lib/route-reducer'

const routeNames = {
	LAMBDA: 'LAMBDA'
}

export default {
	desc: routes(
		route( '/lambda/:id', routeNames.LAMBDA ),
	),
	...routeNames
};
