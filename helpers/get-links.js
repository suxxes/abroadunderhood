import tweetLinks from "tweet-links";
import ramda from "ramda";
import url from "url";
import ungroupInto from "./ungroup-into.js";

const notTwitter = (url) => url.host !== "twitter.com";
const obj2arr = ramda.pipe(ramda.toPairs, ramda.map(ramda.apply(ramda.objOf)));

const extractLinks = ramda.pipe(
	ramda.map(tweetLinks),
	ramda.flatten,
	ramda.uniq,
);

const filterTwitterLinks = ramda.pipe(
	ramda.map(url.parse),
	ramda.filter(notTwitter),
	ramda.map(url.format),
);

const groupByHost = ramda.pipe(
	ramda.groupBy((item) => {
		var host = null;
		var regexp =
			/http(?:s)?:\/\/(?:(www|m)\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?​=]*)?/gi;

		if (regexp.exec(item)) {
			host = "youtube.com";
		} else {
			host = url.parse(item).host;
		}

		return host.split(".").slice(-2).join(".");
	}),
	obj2arr,
	ramda.map(ramda.pipe(ramda.values, ramda.flatten)),
);

const moveMinorsToOther = ramda.pipe(
	ramda.groupBy((item) =>
		ramda.length(item) < 5
			? "other"
			: url.parse(ramda.head(item)).host.split(".").slice(-2).join("."),
	),
	ramda.mapObjIndexed(ramda.flatten),
);

const moveOtherToEnd = ramda.sortBy((group) => group.host === "other");

const getLinks = ramda.pipe(
	extractLinks,
	filterTwitterLinks,
	groupByHost,
	moveMinorsToOther,
	ungroupInto("host", "links"),
	moveOtherToEnd,
);

export default getLinks;
