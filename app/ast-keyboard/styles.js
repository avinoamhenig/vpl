import { colors } from 'styles'

export default props => ({
	container: {
		width: '100%',
		boxSizing: 'border-box',
		padding: 2,
		background: '#eee',
		display: 'flex',
		flexWrap: 'wrap'
	},
	toggleButton: {
		width: '100%',
		padding: 6,
		textAlign: 'center',
		fontSize: 13,
		fontFamily: 'sans-serif',
		color: '#aaa',
		cursor: 'pointer',

		':hover': {
			color: colors.selectedExp
		}
	}
});
