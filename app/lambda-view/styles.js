import { colors } from 'styles';

export default p => {
	let s = {};

	s.header = {
		fontFamily: 'sans-serif',
		color: '#666',
		fontSize: '17px',
		borderBottom: '1px dashed #ddd',
		marginBottom: 5,
		lineHeight: '35px'
	},

	s.title = {
		paddingLeft: 8,
		display: 'inline-block'
	},

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
	},

	s.nestingInfo = {
		float: 'right',
		lineHeight: '35px',
		fontSize: 13,
		paddingRight: 8
	},

	s.disabled = {
		color: '#ddd',
		backgroundColor: 'transparent',
		':hover': { backgroundColor: 'transparent' },
		':active': {backgroundColor: 'transparent' }
	},

	s.infixBtn = [s.nestingBtn, {
		color: p.ignoreInfix ? '#666' : colors.selectedExp
	}],

	s.decNesting = [
		s.nestingBtn,
		p.nestingLimit === 0 && s.disabled
	],

	s.incNesting = [
		s.nestingBtn,
		p.nestingLimit === p.nestedDepth && s.disabled
	],

	s.lambdaIcon = { 'color': '#bbb' },

	s.openLambda = s.nestingBtn,

	s.arg = { 'color': colors.identifier };

	return s;
};