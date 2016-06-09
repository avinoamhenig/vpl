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
		WebkitOverflowScrolling: 'touch'
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

	s.lambdaIcon = { 'color': '#bbb' };

	s.openLambda = s.nestingBtn;

	s.arg = { 'color': colors.identifier };

	return s;
};
