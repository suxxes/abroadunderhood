import save from "./save.js";
import profileMedia from "twitter-profile-media";

const saveMedia = (tokens, abroadunderhood, username, cb) => {
	profileMedia(
		tokens,
		abroadunderhood,
		(err, { image: imageURL, banner: bannerURL }) => {
			if (err) return cb(err);
			save(imageURL, `./images/${username}-image`, (err, image) => {
				if (err) return cb(err);
				save(bannerURL, `./images/${username}-banner`, (err, banner) => {
					if (err) return cb(err);
					cb(null, { image, banner });
				});
			});
		},
	);
};

export default saveMedia;
