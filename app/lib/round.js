export default (num, places) =>
	+( Math.round(`${num}e+${places}`) + `e-${places}` );
