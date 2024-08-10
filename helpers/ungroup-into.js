import ramda from "ramda";

const ungroupInto = (first, second) =>
	ramda.pipe(ramda.toPairs, ramda.map(ramda.zipObj([first, second])));

export default ungroupInto;
