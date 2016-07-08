import React from 'react'
import $ from 'jquery'
import debounce from 'lodash/debounce'

export default class Canvas extends React.Component {
	render () {
		return (
			<canvas
				ref='canvas'
				key='canvas'
				style={this.props.style}
				id={this.props.id}
			></canvas>
		);
	}

	saveCanvas() {
		this.fakeCtx.clearRect(0, 0, this.fakeCanvas.width, this.fakeCanvas.height);
		this.fakeCtx.drawImage(this.refs.canvas, 0, 0);
	}

	restoreCanvas() {
		const ctx = this.refs.canvas.getContext('2d')
		ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
		ctx.drawImage(this.fakeCanvas, 0, 0);
	}

	componentDidMount () {
		const canvas = this.refs.canvas;
		this.fakeCanvas = $('<canvas width="9999" height="9999">')[0];
		this.fakeCtx = this.fakeCanvas.getContext('2d');
		this._resizeHandler = () => {
			this.saveCanvas();
			const parent = $(canvas).parent().parent();
			const width = parent.width();
			const height = parent.height();
			if (canvas.width === width && canvas.height === height) {
				return;
			}
			$(canvas)
				.prop('width', width)
				.prop('height', height);
			this.restoreCanvas();
		};
		this.resizeHandler = debounce(this._resizeHandler, 100);
		$(window).on('resize', this.resizeHandler);
		this._resizeHandler();
	}

	componentWillUpdate() {
		this.saveCanvas();
	}

	componentDidUpdate() {
		this.restoreCanvas();
		this._resizeHandler();
	}

	componentWillUnmount () {
		$(window).off('resize', this.resizeHandler);
	}
}
