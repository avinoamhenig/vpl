import { colors } from 'styles'
import { noSelect } from 'styles'

export default p => {
	const s = {};

	s.container = [{
		width: '100%',
		boxSizing: 'border-box',
		padding: 2,
		background: '#eee'
	}, noSelect];

	s.toolbar = {
		overflow: 'hidden',
		padding: '0 8px'
	};

	s.buttonContainer = {
		display: 'flex',
		flexWrap: 'wrap',
		clear: 'both',
		maxHeight: p.hidden ? 0 : '100%',
		opacity: p.hidden ? 0 : 1,
		overflow: 'hidden',
		transition: 'opacity ease-in 0.2s, max-height ease-in-out 0.2s'
	};

	s.toolbarButton = {
		padding: '8px 8px',
		fontSize: 16,
		fontFamily: 'sans-serif',
		color: '#aaa',
		cursor: 'pointer',

		':hover': {
			color: colors.selectedExp
		}
	};

	s.leftButton = [s.toolbarButton, {
		float: 'left'
	}];

	s.selected = {
		color: colors.selectedExp
	};
	s.leftButtonSelected = [s.leftButton, s.selected];

	s.rightButton = [s.toolbarButton, {
		float: 'right'
	}];

	return s;
};
