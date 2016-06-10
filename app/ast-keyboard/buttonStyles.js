import { colors } from 'styles'

export default p => ({
	buttonContainer: {
		padding: 20,
		background: '#fff',
		fontFamily: 'sans-serif',
		fontSize: 22,
		color: '#777',
		borderRadius: 2,
		cursor: 'pointer',
		flexGrow: 1,
		margin: 2,
		textAlign: 'center',
		fontWeight: '600',

		':hover': {
			background: colors.selectedExp,
			color: 'white'
		}
	}
});
