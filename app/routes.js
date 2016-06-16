import { routes, route } from 'lib/route-reducer'

const routeNames = {
	FN_LIST: 'FN_LIST',
	LAMBDA: 'LAMBDA',
	EXPR: 'EXPR' // TODO make this work
}

export default {
	desc: routes(
		route( '/', routeNames.FN_LIST ),
		route( '/lambda/:id', routeNames.LAMBDA,
	 		route( '/expr/:expr_id', routeNames.EXPR ) )
	),
	...routeNames
};
