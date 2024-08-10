import Twitter from "twit";
import dec from "bignum-dec";
import ramda from "ramda";

const defaults = {
	count: 200,
	trim_user: true,
	include_rts: true,
	exclude_replies: false,
	tweet_mode: "extended",
};

const getNextOptions = (options, tweets) =>
	ramda.isEmpty(tweets)
		? options
		: ramda.merge(options, {
				max_id: ramda.pipe(ramda.last, ramda.prop("id_str"), dec)(tweets),
			});

function accumulate(get, options, tweets, cb) {
	const nextOptions = getNextOptions(options, tweets);
	get(nextOptions, (err, res) => {
		if (err) return cb(err);
		const accumulatedTweets = ramda.concat(tweets, res);
		return ramda.isEmpty(res)
			? cb(null, accumulatedTweets)
			: accumulate(get, nextOptions, accumulatedTweets, cb);
	});
}

export default function getTweets(tokens, username, sinceId, cb) {
	const client = new Twitter(tokens);
	const get = client.get.bind(client, "statuses/user_timeline");
	const options = ramda.merge(defaults, {
		screen_name: username,
		since_id: sinceId,
	});
	return accumulate(get, options, [], cb);
}
