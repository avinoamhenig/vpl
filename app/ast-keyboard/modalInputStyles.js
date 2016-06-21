export default p => ({
	container: {
		position: 'fixed',
		top: 0, bottom: 0, right: 0, left: 0,
		background: 'rgba(0, 0, 0, 0.82)',
		zIndex: 20
	},
	input: {
		boxSizing: 'border-box',
		borderTop: 'none', borderLeft: 'none', borderRight: 'none',
		borderBottom: '1px solid white',
		borderRadius: 0,
		background: 'transparent',
		width: '90%',
		marginLeft: '5%',
		marginTop: 40,
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
