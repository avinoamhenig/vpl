import { colors, noSelect } from 'styles';

export default p => {
	let s = {};

	s.container = [noSelect, {
		display: 'flex',
		flexDirection: 'column',
		position: p.expansionLevel > 0 ? 'static' : 'absolute',
		width: '100%', height: '100%'
	}];

	s.header = {
		fontFamily: 'sans-serif',
		color: '#666',
		fontSize: '17px',
		borderBottom: '1px dashed #ddd',
		marginBottom: 0,
		lineHeight: '35px',
		flex: '0 0 auto'
	};

	s.pane = {
		flexBasis: 0,
		flexGrow: 1,
		height: '100%'
	};

	s.paneContainer = {
		display: p.expansionLevel > 0 ? 'inline' : 'flex',
		flexDirection: 'row',
		height: '100%'
	};

	s.expressionContainer = [s.pane, {
		flex: p.expansionLevel > 0 ? '0 0 auto' : '1 1 0',
		position: p.expansionLevel > 0 ? 'static' : 'relative',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		paddingTop: 0
	}];

	s.canvas = [s.pane, {
		borderLeft: '1px dashed #ddd',
		position: p.showCanvas ? 'static' : 'absolute',
		left: '-200%'
	}];

	s.evalResultExpression = [s.pane, {
		display: p.showEvalResult ? 'block' : 'none',
		borderLeft: p.showEvalResult ? '1px dashed #ddd' : 'none',
		overflow: 'auto',
		WebkitOverflowScrolling: 'touch',
		paddingTop: 0
	}];

	s.backBtn = {
		display: 'inline-block',
		paddingRight: 10,
		cursor: 'pointer',
		':active': {
			color: '#eee'
		}
	};

	s.title = {
		paddingLeft: 8,
		display: 'inline-block'
	};

	s.displayName = {
		cursor: 'pointer',
		color: p.identifier && p.selectedExpId === p.identifier.id
			? colors.selectedExp
			: 'inherit'
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
		float: 'left',
		color: '#666'
	}];

	s.evalResult = [s.nestingInfo, {
		float: 'left',
		marginLeft: 5,
		marginRight: 5,
		color: p.showEvalResult ? 'green' : 'inherit',
		cursor: 'pointer'
	}, p.evalFailed && {
		color: 'red'
	}];

	s.stepModeToggle = [s.nestingInfo, {
		float: 'left',
		color: p.stepMode ? colors.selectedExp : 'inherit',
		cursor: 'pointer',
		marginLeft: 5
	}];

	s.canvasToggle = [s.nestingInfo, {
		float: 'left',
		marginRight: 5,
		color: p.showCanvas ? 'green' : 'inherit',
		cursor: 'pointer'
	}];

	s.evalTime = [s.nestingInfo, {
		float: 'left'
	}];

	s.args = {}
	s.arg = {
		marginLeft: 7,
		cursor: 'pointer'
	};
	s.selectedArg = {
		color: colors.selectedExp
	};

	s.lambdaListItem = {
		listStyle: 'none',
		textAlign: 'left'
	};

	s.lambdaLink = {
		padding: '5px 30px 5px 10px',
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
		maxHeight: '80vh',
		overflow: 'auto',
		zIndex: 1000,
		padding: '5px 0'
	}

	return s;
};
