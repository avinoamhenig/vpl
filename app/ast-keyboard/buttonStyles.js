import { colors } from 'styles'

export default p => ({
	buttonContainer: {
		padding: 20,
		background: '#fff',
		fontFamily: 'sans-serif',
		fontSize: 22,
		color: '#333',
		borderRadius: 5,
		cursor: 'pointer',
		flexGrow: 1,
		margin: 5,
		// maxWidth: 40,
		textAlign: 'center',

		':hover': {
			background: colors.selectedExp,
			color: 'white'
		}
	}
});
