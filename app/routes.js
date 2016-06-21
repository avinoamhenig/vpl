import { routes, route } from 'lib/route-reducer'

const routeNames = {
	FN_LIST: 'FN_LIST',
	FN: 'FN',
	EXPR: 'EXPR' // TODO make this work
}

export default {
	desc: routes(
		route( '/', routeNames.FN_LIST ),
		route( '/fn/:id', routeNames.FN,
	 		route( '/expr/:expr_id', routeNames.EXPR ) )
	),
	...routeNames
};
