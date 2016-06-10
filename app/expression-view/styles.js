import { colors, noSelect } from 'styles';

export const computeStyles = p => {
	let s = {};

	s.level = {
		boxSizing: 'border-box',
		fontFamily: 'Helvetica Neue, sans-serif',
		fontSize: 35,
		fontWeight: '200',
		minHeight: p.level === 1 ? 'auto' : 70,
		lineHeight: '70px',
		borderRadius: p.level === 2 ? 3 : 0,
		marginLeft: p.notFirst ? 12 : 0,
		padding: p.level === 1 ?
			p.expansionLevel === 0 ? '12px 12px 0 12px'
														 : '6px 6px 0 6px'
			: '0 7px',
		marginBottom: p.level === 2 ?
				p.expansionLevel === 0 ? 12 : 6
			: 0,
		backgroundColor: p.selectedExpId === p.expr.id ?
				colors.selectedExp
			: p.level === 1 ? 'rgba(0,0,0,0)' : colors.exp,
		display: 'inline-block',
		cursor: 'pointer'
	},

	s.expandedContainer = {
		position: 'absolute',
		left: 0,
		width: '100%',
		boxSizing: 'border-box',
		paddingTop: 5,
		paddingLeft:  p.expansionLevel === 1 ? 5 : 2,
		paddingRight: p.expansionLevel === 1 ? 5 : 2
	},

	s.expandedLevel = {
		position: 'relative',
		width: '100%',
		top: -8,
		backgroundColor: 'white',
		borderTop: '3px solid ' + colors.selectedExp,
		boxShadow: '0 1px 3px 0 rgba(0,0,0,0.6)',
		borderRadius: 3
	},

	s.arrow = {
		borderBottom: '9px solid ' + colors.selectedExp,
		borderLeft: '9px solid transparent',
		borderRight: '9px solid transparent',
		borderTop: 'none',
		position: 'absolute',
		width: 0,
		zIndex: 20,
		top: 10,
		right: 5
	},

	s.arrowContainer = {
		position: 'relative',
		display: 'inline-block'
	},

	s.expression = [
		s.level,
		(p.expansionLevel > 0 && p.level === 1
			&& p.expandedExpIds[p.expansionLevel - 1] === p.expr.id) ?
				s.expandedLevel : null,
		noSelect
	];

	return s;
};

export const computePieceStyles = (props, piece, i) => {
	const shouldHighlight = (
		!piece.isBlock &&
		piece.id !== props.expr.id &&
		piece.id === props.selectedExpId
	);

	return {
		borderBottom: piece.isFn ?
			  shouldHighlight ? '1px dashed ' + colors.selectedExp
				                : '1px dashed rgba(0,0,0,0.2)'
			: 'none',
		marginLeft: i === 0 ? 3 : 10,
		color: shouldHighlight ? colors.selectedExp : '#000'
	};
};
