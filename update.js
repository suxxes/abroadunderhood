import log from "./helpers/log.js";
import fs from "fs-extra";
import ramda from "ramda";
import moment from "moment";
import dec from "bignum-dec";
import rimraf from "rimraf";
import got from "got";

import authors from "./authors";

import tokens from "twitter-tokens";
import getTweets from "./helpers/get-tweets.js";
import getInfo from "get-twitter-info";
import saveMedia from "./helpers/save-media.js";
import getFollowers from "get-twitter-followers";
import twitterMentions from "twitter-mentions";

import ensureFilesForFirstUpdate from "./helpers/ensure-author-files.js";
import getAuthorArea from "./helpers/get-author-area.js";
import saveAuthorArea from "./helpers/save-author-area.js";

const { first, username } = ramda.head(authors);

ensureFilesForFirstUpdate(username);

const tweets = getAuthorArea(username, "tweets").tweets || [];
const mentions = getAuthorArea(username, "mentions").mentions || [];

const tweetsSinceId = ramda.isEmpty(tweets)
	? dec(first)
	: ramda.last(tweets).id_str;
getTweets(tokens, "abroadunderhood", tweetsSinceId, (err, newTweetsRaw) => {
	if (err) throw err;
	const concattedTweets = ramda.concat(tweets, ramda.reverse(newTweetsRaw));
	saveAuthorArea(username, "tweets", { tweets: concattedTweets });
});

getInfo(tokens, "abroadunderhood", (err, info) => {
	if (err) throw err;

	info.time_zone_offset = 0;
	info.geometry = { lat: 0.0, lng: 0.0 };

	got(
		"https://maps.googleapis.com/maps/api/geocode/json?address=" +
			encodeURIComponent(info.location) +
			"&sensor=false",
	)
		.then((response) => {
			return JSON.parse(response.body).results[0].geometry.location;
		})
		.then((response) => {
			info.geometry.lat = response.lat;
			info.geometry.lng = response.lng;

			got(
				"https://maps.googleapis.com/maps/api/timezone/json?location=" +
					[response.lat, response.lng].join(",") +
					"&timestamp=" +
					((new Date(info.status.created_at).getTime() / 1000) | 0) +
					"&sensor=false",
			)
				.then((response) => {
					return (
						(JSON.parse(response.body).rawOffset +
							JSON.parse(response.body).dstOffset) /
						60
					);
				})
				.then((response) => {
					info.time_zone_offset = response;

					saveAuthorArea(username, "info", info);
				})
				.catch((error) => {
					saveAuthorArea(username, "info", info);
				});
		})
		.catch((error) => {
			saveAuthorArea(username, "info", info);
		});
});

rimraf.sync(`./dump/images/${username}*`);
saveMedia(tokens, "abroadunderhood", username, (err, media) => {
	if (err) throw err;
	saveAuthorArea(username, "media", media);
});

getFollowers(tokens, "abroadunderhood", (err, followersWithStatuses) => {
	if (err) throw err;
	const followers = ramda.map(ramda.dissoc("status"), followersWithStatuses);
	saveAuthorArea(username, "followers", { followers });
});

const mentionsSinceId = ramda.isEmpty(mentions)
	? first
	: ramda.last(mentions).id_str;
twitterMentions(tokens, mentionsSinceId, (err, newMentionsRaw) => {
	if (err) throw err;
	const concattedMentions = ramda.concat(
		mentions,
		ramda.reverse(newMentionsRaw),
	);
	saveAuthorArea(username, "mentions", { mentions: concattedMentions });
});

fs.outputFile("./dump/.timestamp", moment().unix(), (err) => {
	log(`${err ? "✗" : "✓"} timestamp`);
});
