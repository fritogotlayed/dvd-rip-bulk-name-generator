const _ = require('lodash');
const express = require('express');
const TVDB = require('node-tvdb');

const cache = require('../lib/cache');
const globals = require('../globals');

const router = express.Router();

/**
 * @returns {TVDB}
 */
const getTvDbApi = () => {
  let api = cache.get('tvdb-client');
  if (!api) {
    const apiKey = process.env.TVDB_API_KEY;
    api = new TVDB(apiKey);
    cache.set('tvdb-client', api);
  }
  return api;
};

const searchShow = (request, response) => {
  const { query } = request;
  const api = getTvDbApi();
  api.getSeriesByName(query.t)
    .then((data) => {
      response.write(JSON.stringify(data));
      response.status(200);
      response.send();
    })
    .catch((err) => {
      const logger = globals.getLogger();
      logger.warn({ err }, 'Error searching show');
      response.write('');
      response.status(500);
      response.send();
    });
};

const listEpisodes = (request, response) => {
  const { params } = request;
  const { showId } = params;

  const api = getTvDbApi();
  api.getEpisodesBySeriesId(showId)
    .then((data) => _.map(data, (e) => {
      const season = e.dvdSeason || e.airedSeason;
      const episodeNumber = e.dvdEpisodeNumber || e.airedEpisodeNumber;
      return _.merge({}, e, { season, episodeNumber });
    }))
    .then((data) => {
      response.write(JSON.stringify(data));
      response.status(200);
      response.send();
    })
    .catch((err) => {
      const logger = globals.getLogger();
      logger.warn({ err }, 'Error searching show');
      response.write('');
      response.status(500);
      response.send();
    });
};

router.get('/search', searchShow);
router.get('/episodesForShow/:showId', listEpisodes);

module.exports = router;
