import fs from "fs-extra";

export default function ensureAuthorFiles(username) {
	fs.ensureDirSync("./dump/images");
	["info", "tweets", "media", "mentions"].map((area) => {
		fs.ensureFileSync(`./dump/${username}-${area}.json`);
	});
}
