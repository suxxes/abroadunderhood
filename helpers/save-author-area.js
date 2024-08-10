import fs from "fs-extra";
import log from "./log.js";

const spaces = 2;

export default function saveAuthorArea(username, area, content) {
	fs.outputJSON(
		`./dump/${username}-${area}.json`,
		content,
		{ spaces },
		(err) => {
			log(`${err ? "✗" : "✓"} ${username}’s ${area}`);
		},
	);
}
