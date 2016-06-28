import { colors, noSelect } from 'styles'

export default p => {
	const s = {};

	s.expressionWrapper = {
		display: p.nestedLevel === 0 ? 'block' : 'inline-block'
	};

	const inset = 7;
	const radius = 4;
	s.expression = [noSelect, {
		display: p.nestedLevel === 0 ? 'block' : 'inline-block',
		fontFamily: 'Helvetica Neue, sans-serif',
		fontSize: 35,
		fontWeight: '200',
		cursor: 'pointer',
		background:p.selectedExpId === p.expressionId
			? colors.selectedExp
			: p.nestedLevel === 0 ? 'none' : colors.exp,
		borderRadius: p.nestedLevel === 1 ? radius : 0,
		paddingRight: inset,
		paddingTop: p.nestedLevel === 0 ? inset : 0,
		marginBottom: p.nestedLevel === 1 ? inset : 0,
		marginLeft: p.nestedLevel === 0 ? 0 : inset,
		paddingLeft: p.nestedLevel === 0 ? inset : 0
	}];

	s.first = {
		display: 'inline-block',
		marginLeft: p.nestedLevel === 0 ? -inset : 0
	};

	s.leaf = [s.expression, {
		border: 'none',
		display: 'inline-block',
		paddingRight: 0,
		paddingTop: 0, paddingBottom : 0,
		marginTop: 0,
		marginRight: 0, marginBottom: 0,
		background: 'none',
		verticalAlign: 'top'
	}];

	s.piece = {
		lineHeight: '40px',
		paddingTop: 20,
		paddingBottom: 20,
		display: 'inline-block',
		verticalAlign: 'top'
	};

	s.smallPiece = [s.piece, {
		fontSize: 17,
		lineHeight: '40px',
		paddingTop: 22,
		paddingBottom: 18
	}];

	s.light = {
		color: 'rgba(0,0,0,0.4)'
	};

	s.selectable = {
		color: p.selectedExpId === p.expressionId
			? colors.selectedExp
			: 'black'
	};

	s.appFn = {
		borderBottom: '1px dashed ' +
			(p.selectedExpId === p.expressionId
				? colors.selectedExp
				: 'rgba(0,0,0,0.2)')
	};

	s.expandPiece = [s.smallPiece, s.selectable]

	s.expandedContainer = {
		position: 'absolute',
		backgroundColor: 'white',
		borderTop: '3px solid black',
		boxShadow: '0 1px 3px 0 rgba(0,0,0,0.6)',
		borderRadius: radius,
		marginBottom: 15,
		zIndex: 100
	};

	s.arrow = {
		borderBottom: '9px solid black',
		borderLeft: '9px solid transparent',
		borderRight: '9px solid transparent',
		borderTop: 'none',
		position: 'absolute',
		width: 0,
		zIndex: 20
	};

	s.scopedIdentContainer = {
		display: 'inline-block',
		position: 'absolute',
		marginLeft: 10,
		marginTop: -5
	};

	s.scopedIdentifier = {
		float: 'left',
		top: 0,
		fontSize: 13,
		padding: '3px 7px',
		background: '#fff',
		border: '1px solid #888',
		color: '#888',
		borderRadius: 10,
		marginRight: 7
	};

	s.selectedIdentifier = {
		background: colors.selectedExp,
		color: 'white',
		border: `1px solid ${colors.selectedExp}`
	};

	return s;
};
