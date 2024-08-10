import ramda from "ramda";
import authors from "../authors.js";
import getAuthorArea from "../helpers/get-author-area.js";

const saturate = (author) =>
	ramda.merge(author, {
		info: getAuthorArea(author.username, "info") || {},
		tweets: getAuthorArea(author.username, "tweets").tweets || [],
		media: getAuthorArea(author.username, "media") || {},
		mentions: getAuthorArea(author.username, "mentions").mentions || [],
	});

export default ramda.map(saturate, authors);
