let backing = {};

const get = (key) => backing[key];
const set = (key, value) => { backing[key] = value; };
const bust = () => { backing = {}; };

module.exports = {
  get,
  set,
  bust,
};
