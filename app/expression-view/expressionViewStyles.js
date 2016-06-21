import { colors, noSelect } from 'styles'

export default p => {
	const s = {};

	const inset = 5;
	const spacing = 7;
	const radius = inset - 2;
	s.expression = [noSelect, {
		display: 'inline-block',
		fontFamily: 'Helvetica Neue, sans-serif',
		fontSize: 35,
		fontWeight: '200',
		cursor: 'pointer',
		background:p.selectedExpId === p.expressionId
			? p.expansionLevel > 0 && p.nestedLevel === 0 ? 'none' : colors.selectedExp
			: p.nestedLevel === 0
				? 'none'
				: colors.exp,
		borderRadius: p.nestedLevel === 1 ? radius : 0,
		paddingRight: inset,
		paddingTop: p.nestedLevel === 0 ? inset : 0,
		marginBottom: p.nestedLevel === 1 ? inset : 0,
		marginLeft: p.nestedLevel === 0 ? 0 : p.nestedLevel === 1 ? inset : spacing,
		paddingLeft: p.nestedLevel === 0 ? inset : 0
	}];

	s.first = {
		display: 'inline-block',
		marginLeft: p.nestedLevel === 0 ? -inset : inset - spacing
	};

	s.leaf = [s.expression, {
		paddingRight: 0,
		paddingTop: 0, paddingBottom : 0,
		marginTop: 0,
		marginRight: 0, marginBottom: 0,
		background: 'none',
		verticalAlign: 'top'
	}];

	s.piece = {
		lineHeight: '40px',
		paddingTop: 15,
		paddingBottom: 15,
		display: 'inline-block',
		verticalAlign: 'top'
	};

	s.smallPiece = [s.piece, {
		fontSize: 17,
		lineHeight: '40px',
		paddingTop: 17,
		paddingBottom: 13
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
		left: p.expansionLevel === 0 ? inset : inset/2,
		right: p.expansionLevel === 0 ? inset : inset/2,
		backgroundColor: 'white',
		borderTop: '3px solid black',
		boxShadow: '0 1px 3px 0 rgba(0,0,0,0.6)',
		borderRadius: radius,
		marginTop: -5,
		marginBottom: 10
	};

	s.arrow = {
		borderBottom: '9px solid black',
		borderLeft: '9px solid transparent',
		borderRight: '9px solid transparent',
		borderTop: 'none',
		position: 'absolute',
		width: 0,
		zIndex: 20,
		top: 26,
		left: -2
	};

	s.arrowContainer = {
		position: 'relative',
		display: 'inline-block'
	};

	return s;
};
