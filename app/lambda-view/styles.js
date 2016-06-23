import { colors } from 'styles';

export default p => {
	let s = {};

	s.container = {
		display: 'flex',
		flexDirection: 'column',
		position: p.expansionLevel > 0 ? 'static' : 'absolute',
		width: '100%', height: '100%',
		overflow: 'hidden'
	};

	s.header = {
		fontFamily: 'sans-serif',
		color: '#666',
		fontSize: '17px',
		borderBottom: '1px dashed #ddd',
		marginBottom: 0,
		lineHeight: '35px',
		flex: '0 0 auto'
	};

	s.expressionContainer = {
		flex: p.expansionLevel > 0 ? '0 0 auto' : '1 1 0',
		position: p.expansionLevel > 0 ? 'static' : 'relative',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		paddingTop: 5
	};

	s.title = {
		paddingLeft: 8,
		display: 'inline-block'
	};

	s.nestingBtn = {
		float: 'right',
		lineHeight: '35px',
		cursor: 'pointer',
		width: 30,
		textAlign: 'center',
		':hover': {
			backgroundColor: '#eee'
		},
		':active': {
			backgroundColor: '#ddd'
		}
	};

	s.nestingInfo = {
		float: 'right',
		lineHeight: '35px',
		fontSize: 13,
		paddingRight: 8
	};

	s.disabled = {
		color: '#ddd',
		backgroundColor: 'transparent',
		':hover': { backgroundColor: 'transparent' },
		':active': {backgroundColor: 'transparent' }
	};

	s.infixBtn = [s.nestingBtn, {
		color: p.ignoreInfix ? '#666' : colors.selectedExp
	}];

	s.decNesting = [
		s.nestingBtn,
		p.nestingLimit === 0 && s.disabled
	];

	s.incNesting = s.nestingBtn;

	s.fnListBtn = [s.nestingBtn, {
		':hover': {
			backgroundColor: 'none'
		},
		':active': {
			backgroundColor: 'none'
		},
		color: p.showFnList ? 'black' : 'inherit'
	}];

	s.lambdaIcon = { 'color': '#bbb' };

	s.openLambda = s.nestingBtn;

	s.runBtn = [s.nestingBtn, {
		float: 'left'
	}];

	s.leftBtn = [s.nestingBtn, {
		float: 'left'
	}];

	s.evalResult = [s.nestingInfo, {
		float: 'left',
		marginLeft: 10,
		color: 'green'
	}, p.evalFailed && {
		color: 'red'
	}];

	s.arg = { 'color': colors.identifier };

	s.lambdaListItem = {
		listStyle: 'none',
		textAlign: 'left'
	};

	s.lambdaLink = {
		padding: '5px 10px',
		fontSize: 26,
		textDecoration: 'none',
		display: 'block',
		color: '#888',
		':hover': {
			color: 'black',
			background: '#eee'
		}
	};

	s.addLambdaButton = [s.lambdaLink, {
		cursor: 'pointer',
		':hover': {
			background: 'none'
		}
	}];

	s.fnListDrop = {
		display: p.showFnList ? 'block' : 'none',
		position: 'absolute',
		right: 5,
		marginTop: -5,
		background: 'white',
		border: '1px solid #aaa',
		borderRadius: 10,
		maxHeight: '70vh',
		overflow: 'auto',
		zIndex: 5000,
		padding: '5px 0'
	}

	return s;
};
