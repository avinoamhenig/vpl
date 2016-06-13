export default props => {
	const s = {};

	s.lambdaEditContainer = {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		height: '100vh'
	};

	s.lambdaContainer = {
			minHeight: 0,
			flex: '1 1 0',
			position: 'relative'
	};

	s.keyboardContainer = {
			flex: '0 0 auto',
			position: 'relative',
			zIndex: 100
	};

	s.lambdaListItem = {
		padding: 10
	};

	s.lambdaLink = {
		fontSize: 26,
		textDecoration: 'none',
		color: '#888',
		':hover': {
			color: 'black'
		}
	};

	s.addLambdaButton = [s.lambdaLink, {
		cursor: 'pointer'
	}];

	return s;
};
