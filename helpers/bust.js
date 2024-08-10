import path from "node:path";
import hasha from "hasha";
import ramda from "ramda";

const join = ramda.curryN(3, path.join);
const hash = ramda.curryN(2, hasha.fromFileSync);

const hashPath = ramda.pipe(
	join(process.cwd(), "dist"),
	hash(ramda.__, { algorithm: "md5" }),
);

const bust = (path) => `${path}?${hashPath(path)}`;

export default ramda.memoize(bust);
