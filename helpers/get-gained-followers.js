import getAuthorArea from "./get-author-area.js";
import authors from "../authors.js";
import R from "ramda";

const prev = (authorId) =>
	(authors[R.inc(R.findIndex(R.propEq("authorId", authorId), authors))] || {})
		.authorId;
const followers = (authorId) =>
	getAuthorArea(authorId, "info").followers_count || 0;

// getGainedFollowers :: String -> Number
export default function getGainedFollowers(authorId) {
	return followers(authorId) - followers(prev(authorId));
}
