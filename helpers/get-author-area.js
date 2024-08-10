import fs from "fs-extra";

export default function getAuthorArea(username, area) {
	try {
		return fs.readJsonSync(`./dump/${username}-${area}.json`);
	} catch (e) {
		return {};
	}
}
