import React from 'react'
import helmet from 'lib/helmetDecorator'
import { bindActionCreators, compose } from 'redux'
import { connect } from 'react-redux'
import { matchOne, navigate } from 'lib/route-reducer'
import routes from 'routes'
import name from 'lib/name'
import LambdaView from 'lambda-view'
import Radium from 'radium'

const Main = compose(
	name('Main'), Radium,
	helmet({
		defaultTitle: "VPL",
		titleTemplate: "VPL - %s",
		link: [
			{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css' },
			{ rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css' }
		],
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport',
			  content: 'initial-scale=1, maximum-scale=1' }
		]
	})
)(({ route, navigate, ast }) => {
	const routeMatch = matchOne(routes.desc, route);

	switch (routeMatch.key) {
		case routes.LAMBDA:
			return (<LambdaView />);
		case routes.FN_LIST:
			let listItems = ast.map(fnDef => {
				return (
					<li style={{ padding: 10 }} key={fnDef.name}>
						<a
							href={`/lambda/${fnDef.name}`}
							key={fnDef.name}
							style={{
								fontSize: 26,
								textDecoration: 'none',
								color: '#888'
							}}
							onClick={e => {
								e.preventDefault();
								navigate(`/lambda/${fnDef.name}`);
							}}>{fnDef.name}</a>
					</li>
				);
			});
			return (<ul key="fn_list">{listItems}</ul>);
		default:
			return (<div>Route not found!</div>);
	}
});

const mapStateToProps = (state) => ({
	route: state.route.current,
	ast: state.ast
});
const mapDispatchToProps = (dispatch) =>
	bindActionCreators({navigate}, dispatch);
const MainContainer = connect(mapStateToProps, mapDispatchToProps)(Main);

export default MainContainer;
export { Main, MainContainer };
