import { colors } from 'styles'

export default p => ({
	buttonContainer: {
		padding: 20,
		display: 'inline-block',
		background: '#fff',
		margin: '6px 0 0 6px',
		fontFamily: 'sans-serif',
		fontSize: 22,
		color: '#333',
		borderRadius: 5,
		cursor: 'pointer',

		':hover': {
			background: colors.selectedExp,
			color: 'white'
		}
	}
});
