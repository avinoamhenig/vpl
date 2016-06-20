import { colors, noSelect } from 'styles'

export default p => {
	const s = {};

	s.expressionContainer = [noSelect, {
		display: p.nestedLevel === 0 ? 'block' : 'inline-block',
		fontFamily: 'Helvetica Neue, sans-serif',
		fontSize: 35,
		fontWeight: '200',
		cursor: 'pointer',
		verticalAlign: 'middle'
	}];

	const spacing = 5;
	const margin = p.nestedLevel === 0 ? 0 : spacing;
	s.expression = {
		background:p.selectedExpId === p.expressionId
			? colors.selectedExp
			: p.nestedLevel === 0
				? 'none'
				: colors.exp,
		display: p.nestedLevel === 0 ? 'block' : 'inline-block',
		borderRadius: p.nestedLevel === 1 ? spacing - 2 : 0,
		marginRight: margin,
		paddingLeft: spacing,
		paddingTop: p.nestedLevel === 0 ? spacing : 0,
		marginBottom: p.nestedLevel === 1 ? spacing : 0,
		verticalAlign: 'middle'
	};

	const piecePadding = 9;
	s.piece = {
		display: 'inline-block',
		marginLeft: -spacing,
		paddingLeft: piecePadding,
		paddingRight: piecePadding,
		verticalAlign: 'middle',
		lineHeight: '70px'
	};

	s.smallPiece = [s.piece, {
		fontSize: 17,
		paddingLeft: piecePadding * .65,
		paddingRight: piecePadding * .65
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

	s.expandPiece = [s.piece, s.selectable, {
		fontSize: 17,
		lineHeight: 'auto'
	}];

	return s;
};
