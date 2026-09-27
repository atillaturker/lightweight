/**
 * Pin the test time zone so date tests are deterministic on every machine.
 * America/New_York is west of UTC and observes daylight saving, so tests
 * catch both UTC-anchored and fixed-24-hour week arithmetic.
 */
module.exports = () => {
  process.env.TZ = 'America/New_York';
};
