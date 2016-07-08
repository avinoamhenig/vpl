import $ from 'jquery'

export default function (canvas) {
	const ctx = canvas.getContext('2d');
	const width = $(canvas).width();
	const height = $(canvas).height();

	let angle = 0;
	let curX = width/2;
	let curY = height/2;

	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();
	ctx.moveTo(curX, curY);

	return {
		turn (degrees) {
			angle = (angle * 180/Math.PI + degrees) * Math.PI/180;
		},

		move (distance) {
			curX += Math.cos(angle) * distance;
		  curY += Math.sin(angle) * distance;
		  ctx.moveTo(curX, curY);
		},

		draw (distance) {
		  curX += Math.cos(angle) * distance;
		  curY += Math.sin(angle) * distance;
		  ctx.lineTo(curX, curY);
		},

		done () {
			ctx.stroke();
		}
	};
};
