import { routes, route } from 'lib/route-reducer'

const routeNames = {
	ROOT: 'ROOT',
	FN: 'FN',
	EXPR: 'EXPR' // TODO make this work
}

export default {
	desc: routes(
		route( '/', routeNames.ROOT ),
		route( '/fn/:id', routeNames.FN,
	 		route( '/expr/:expr_id', routeNames.EXPR ) )
	),
	...routeNames
};
