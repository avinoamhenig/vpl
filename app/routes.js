import { routes, route } from './lib/route-reducer'

const routeNames = {
	LAMBDA: 'LAMBDA',
	EXPR: 'EXPR'
}

export default {
	desc: routes(
		route( '/lambda/:id', routeNames.LAMBDA,
	 		route( '/expr/:expr_id', routeNames.EXPR ) )
	),
	...routeNames
};
