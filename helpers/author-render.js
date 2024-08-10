import moment from "moment";
import ramda from "ramda";
import numd from "numd";
import renderTweet from "tweet.md";
import getLinks from "./get-links.js";
import commonmarkHelpers from "commonmark-helpers";
import ungroupInto from "./ungroup-into.js";
import unidecode from "unidecode";
import trimTag from "trim-html-tag";
import url_1 from "node:url";
import authors from "../dump/index.js";

const getQuotedUser = ramda.pipe(
	ramda.path(["entities", "urls"]),
	ramda.map(ramda.prop("expanded_url")),
	ramda.map(ramda.replace("/mobile.twitter.com/", "/twitter.com/")),
	ramda.filter((url) => url_1.parse(url).host === "twitter.com"),
	ramda.head,
	ramda.pipe(url_1.parse, ramda.prop("path"), ramda.split("/"), ramda.nth(1)),
);

moment.locale("ru");

const weekday = (date, offset) =>
	moment(new Date(date)).utcOffset(offset).format("dddd");
const tweetLink = (tweet) =>
	`https://twitter.com/abroadunderhood/status/${tweet.id_str}`;
const tweetTime = (tweet, offset) =>
	moment(new Date(tweet.created_at)).utcOffset(offset).format("H:mm");

const authorsToPost = ramda.filter((author) => author.post !== false, authors);

const authorIndex = (author) =>
	ramda.findIndex(ramda.propEq("username", author.username))(authorsToPost);
const isFirstAuthor = (author) =>
	authorIndex(author) === ramda.dec(ramda.length(authorsToPost));
const isLastAuthor = (author) =>
	author.username === ramda.prop("username", ramda.head(authorsToPost));
const nextAuthor = (author) => {
	if (!isLastAuthor(author))
		return ramda.nth(ramda.dec(authorIndex(author)), authorsToPost);
};
const prevAuthor = (author) => {
	if (!isFirstAuthor(author))
		return ramda.nth(ramda.inc(authorIndex(author)), authorsToPost);
};

const d = (input, offset) =>
	moment(input).utcOffset(offset).format("D MMMM YYYY");
const gd = (input, offset) =>
	moment(input).utcOffset(offset).format("YYYY-MM-DD");
const tweetsUnit = numd("твит", "твита", "твитов");
const capitalize = ramda.converge(ramda.concat, [
	ramda.pipe(ramda.head, ramda.toUpper),
	ramda.tail,
]);
const filterTimeline = (item) =>
	item.text[0] !== "@" || item.text.indexOf("@abroadunderhood") === 0;
const fullText = (item) => {
	item.text = item.full_text || item.text;

	if (item.quoted_status) {
		item.quoted_status.text =
			item.quoted_status.full_text || item.quoted_status.text;
	}

	if (item.retweeted_status) {
		item.retweeted_status.text =
			item.retweeted_status.full_text || item.retweeted_status.text;
	}

	return item;
};
const prepareTweets = (tweets, offset) => {
	tweets = ramda.map(fullText, tweets);
	tweets = ramda.filter(filterTimeline, tweets);
	tweets = ramda.groupBy((item) => gd(item.created_at, offset), tweets);

	return ungroupInto("weekday", "tweets")(tweets);
};
const renderVideo = (url) => {
	var regexp =
		/http(?:s)?:\/\/(?:(www|m)\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?​=]*)?/gi;
	var matches = regexp.exec(url);

	if (matches) {
		return (
			'<p class="embed-responsive embed-responsive-16by9"><iframe src="//www.youtube.com/embed/' +
			matches[2] +
			'" width="720" height="' +
			720 * (9 / 16) +
			'" class="embed-responsive-item"></iframe></p>'
		);
	}
};

export default {
	d,
	weekday,
	prepareTweets,
	capitalize,
	tweetsUnit,
	getQuotedUser,
	unidecode,
	prevAuthor,
	nextAuthor,
	render: ramda.pipe(renderTweet, commonmarkHelpers.html, trimTag),
	renderVideo: renderVideo,
	tweetTime,
	tweetLink,
	getLinks,
};
