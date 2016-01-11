import log from './helpers/log';
import { outputFile } from 'fs-extra';
import { isEmpty, concat, reverse, last, dissoc, map, head } from 'ramda';
import moment from 'moment';
import dec from 'bignum-dec';
import { sync as rm } from 'rimraf';
import got from 'got';

import authors from './authors';

import tokens from 'twitter-tokens';
import getTweets from 'get-tweets';
import getInfo from 'get-twitter-info';
import saveMedia from './helpers/save-media';
import getFollowers from 'get-twitter-followers';
import twitterMentions from 'twitter-mentions';

import ensureFilesForFirstUpdate from './helpers/ensure-author-files';
import getAuthorArea from './helpers/get-author-area';
import saveAuthorArea from './helpers/save-author-area';

const { first, username } = head(authors);

ensureFilesForFirstUpdate(username);

const tweets = getAuthorArea(username, 'tweets').tweets || [];
const mentions = getAuthorArea(username, 'mentions').mentions || [];

const tweetsSinceId = isEmpty(tweets) ? dec(first) : last(tweets).id_str;
getTweets(tokens, 'abroadunderhood', tweetsSinceId, (err, newTweetsRaw) => {
  if (err) throw err;
  const concattedTweets = concat(tweets, reverse(newTweetsRaw));
  saveAuthorArea(username, 'tweets', { tweets: concattedTweets });
});

getInfo(tokens, 'abroadunderhood', (err, info) => {
  if (err) throw err;

  got('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(info.location) + '&sensor=false')
    .then(response => {
      return JSON.parse(response.body).results[0].geometry.location;
    })
    .then(response => {
      info.geometry = {};
      info.geometry.lat = response.lat;
      info.geometry.lng = response.lng;

      got('https://maps.googleapis.com/maps/api/timezone/json?location=' + [response.lat, response.lng].join(',') + '&timestamp=' + ((new Date(info.status.created_at)).getTime() / 1000 | 0) + '&sensor=false')
        .then(response => {
          return (JSON.parse(response.body).rawOffset + JSON.parse(response.body).dstOffset) / 60;
        })
        .then(response => {
          info.time_zone_offset = response;

          saveAuthorArea(username, 'info', info);
        })
        .catch(error => {
          saveAuthorArea(username, 'info', info);
        });
    })
    .catch(error => {
      saveAuthorArea(username, 'info', info);
    });
});

rm(`./dump/images/${username}*`);
saveMedia(tokens, 'abroadunderhood', username, (err, media) => {
  if (err) throw err;
  saveAuthorArea(username, 'media', media);
});

getFollowers(tokens, 'abroadunderhood', (err, followersWithStatuses) => {
  if (err) throw err;
  const followers = map(dissoc('status'), followersWithStatuses);
  saveAuthorArea(username, 'followers', { followers });
});

const mentionsSinceId = isEmpty(mentions) ? first : last(mentions).id_str;
twitterMentions(tokens, mentionsSinceId, (err, newMentionsRaw) => {
  if (err) throw err;
  const concattedMentions = concat(mentions, reverse(newMentionsRaw));
  saveAuthorArea(username, 'mentions', { mentions: concattedMentions });
});

outputFile('./dump/.timestamp', moment().unix(), err => {
  log(`${err ? '✗' : '✓'} timestamp`);
});
