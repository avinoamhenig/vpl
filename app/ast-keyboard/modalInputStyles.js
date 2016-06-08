export default p => ({
	container: {
		position: 'fixed',
		top: 0, bottom: 0, right: 0, left: 0,
		background: 'rgba(0, 0, 0, 0.6)',
		zIndex: 20
	},
	input: {
		borderTop: 'none', borderLeft: 'none', borderRight: 'none',
		borderBottom: '1px solid white',
		background: 'transparent',
		width: '90%',
		marginLeft: '5%',
		marginTop: '20%',
		marginBottom: 30,
		fontSize: 40,
		padding: 20,
		outline: 'none',
		color: 'white'
	},
	button: {
		width: '90%',
		marginLeft: '5%',
		border: '1px solid white',
		background: 'none',
		fontSize: 40,
		padding: 20,
		outline: 'none',
		color: 'white',
		cursor: 'pointer',
		':active': {
			background: 'white',
			color: 'black'
		}
	}
});
