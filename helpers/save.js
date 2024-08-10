import got from "got";
import ftype from "file-type";
import fs from "node:fs";

export default function save(image, path, cb) {
	got(image, { encoding: null })
		.then(({ body }) => ({ body, ext: ftype(body).ext }))
		.then(({ body, ext }) => {
			fs.writeFile(`./dump/${path}.${ext}`, body, (err) => {
				if (err) return cb(err);
				cb(null, `${path}.${ext}`.replace("dump/", ""));
			});
		})
		.catch(cb);
}
