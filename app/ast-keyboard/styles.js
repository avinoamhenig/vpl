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
		transition: 'visibility 0.2s, opacity 0.2s',

		':hover': {
			color: colors.selectedExp
		}
	};

	s.toggleButton = [s.toolbarButton, {
		float: 'left',
		visibility: 'visible',
		opacity: 1
	}];

	s.rightButton = [s.toolbarButton, {
		float: 'right'
	}];

	const showIfSelected = {
		visibility: p.isNodeSelected ? 'visible' : 'hidden',
		opacity: p.isNodeSelected ? 1 : 0
	};
	s.addBtn =
	s.rmBtn =
	s.bindBtn =
	s.nameBtn =
		[...s.rightButton, showIfSelected];

	return s;
};
