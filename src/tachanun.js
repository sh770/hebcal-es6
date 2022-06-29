import {HDate, months} from './hdate';
import {dateYomHaZikaron} from './modern';

/**
 * @private
 * @param {number} start
 * @param {number} end
 * @return {number[]}
 */
function range(start, end) {
  const arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
}

const cache = Object.create(null);

/**
 * @typedef {Object} TachanunResult
 * @property {boolean} noTachanun No Tachanun, according to everybody
 * @property {boolean} shacharit Tachanun is said at Mincha
 * @property {boolean} mincha Tachanun is said at Shacharit
 * @property {boolean} allCongs All congregations say Tachanun on the day
 * @private
 */

/** @type {TachanunResult} */
const NONE = {
  noTachanun: true,
  shacharit: false,
  mincha: false,
  allCongs: false,
};

/**
 * Return details on what Tachanun (or Tzidchatcha on Shabbat) is said on `hdate`.
 *
 * Tachanun is not said on Rosh Chodesh, the month of Nisan, Lag Baomer,
 * Rosh Chodesh Sivan until Isru Chag, Tisha B'av, 15 Av, Erev Rosh Hashanah,
 * Rosh Hashanah, Erev Yom Kippur until after Simchat Torah, Chanukah,
 * Tu B'shvat, Purim and Shushan Purim, and Purim and Shushan Purim Katan.
 *
 * In some congregations Tachanun is not said until from Rosh Chodesh Sivan
 * until 14th Sivan, Sukkot until after Rosh Chodesh Cheshvan, Pesach Sheini,
 * Yom Ha'atzmaut, and Yom Yerushalayim.
 *
 * Tachanun is not said at Mincha on days before it is not said at Shacharit.
 *
 * Tachanun is not said at Shacharit on Shabbat, but is at Mincha, usually.
 * @private
 * @param {HDate} hdate
 * @param {boolean} il
 * @return {TachanunResult}
 */
export function tachanun(hdate, il) {
  return tachanun0(hdate, il, true);
}

/**
 * @private
 * @param {HDate} hdate
 * @param {boolean} il
 * @param {boolean} checkNext
 * @return {TachanunResult}
 */
function tachanun0(hdate, il, checkNext) {
  const year = hdate.getFullYear();
  const key = `${year}-${il ? 1 : 0}`;
  const dates = cache[key] = cache[key] || tachanunYear(year, il);
  const abs = hdate.abs();
  if (dates.none.indexOf(abs) > -1) {
    return NONE;
  }
  const dow = hdate.getDay();
  const ret = {
    noTachanun: false,
    shacharit: false,
    mincha: false,
    allCongs: false,
  };
  if (dates.some.indexOf(abs) === -1) {
    ret.allCongs = true;
  }
  if (dow !== 6) {
    ret.shacharit = true;
  }
  const tomorrow = abs + 1;
  if (checkNext && dates.yesPrev.indexOf(tomorrow) === -1) {
    const tmp = tachanun0(new HDate(tomorrow), il, false);
    ret.mincha = tmp.shacharit;
  } else {
    ret.mincha = (dow !== 5);
  }
  if (ret.allCongs && !ret.mincha && !ret.shacharit) {
    return NONE;
  }
  return ret;
}

/**
 * @private
 * @param {number} year
 * @param {boolean} il
 * @return {*}
 */
function tachanunYear(year, il) {
  const leap = HDate.isLeapYear(year);
  const monthsInYear = 12 + leap;
  let av9dt = new HDate(9, months.AV, year);
  if (av9dt.getDay() === 6) {
    av9dt = av9dt.next();
  }
  let shushPurim = new HDate(15, months.ADAR_II, year);
  if (shushPurim.getDay() === 6) {
    shushPurim = shushPurim.next();
  }
  const none = [].concat(
      // Rosh Chodesh - 1st of every month. Also includes RH day 1 (1 Tishrei)
      range(1, monthsInYear)
          .map((month) => new HDate(1, month, year)),
      // Rosh Chodesh - 30th of months that have one
      range(1, monthsInYear)
          .filter((month) => HDate.daysInMonth(month, year) === 30)
          .map((month) => new HDate(30, month, year)),
      new HDate(2, months.TISHREI, year), // Rosh Hashana II
      // entire month of Nisan
      range(1, HDate.daysInMonth(months.NISAN, year))
          .map((mday) => new HDate(mday, months.NISAN, year)),
      new HDate(18, months.IYYAR, year), // Lag BaOmer
      // Rosh Chodesh Sivan thru Isru Chag
      range(1, 8 - (il ? 1 : 0))
          .map((mday) => new HDate(mday, months.SIVAN, year)),
      av9dt, // Tisha B'Av
      new HDate(15, months.AV, year), // Tu B'Av
      new HDate(29, months.ELUL, year), // Erev Rosh Hashanah
      // Erev Yom Kippur thru Isru Chag
      range(9, 24 - (il ? 1 : 0))
          .map((mday) => new HDate(mday, months.TISHREI, year)),
      // Chanukah
      range(25, 33)
          .map((mday) => new HDate(mday, months.KISLEV, year)),
      new HDate(15, months.SHVAT, year), // Tu BiShvat
      new HDate(14, months.ADAR_II, year), // Purim
      shushPurim,
      leap ? new HDate(14, months.ADAR_I, year) : [], // Purim Katan
  );
  const some = [].concat(
      // Until 14 Sivan
      range(1, 13)
          .map((mday) => new HDate(mday, months.SIVAN, year)),
      // Until after Rosh Chodesh Cheshvan
      range(20, 31)
          .map((mday) => new HDate(mday, months.TISHREI, year)),
      new HDate(14, months.IYYAR, year), // Pesach Sheini
      // Yom HaAtzma'ut, which changes based on day of week
      year >= 5708 ? dateYomHaZikaron(year).next() : [],
      // Yom Yerushalayim
      year >= 5727 ? new HDate(28, months.IYYAR, year) : [],
  );
  const yesPrev = [].concat(
      new HDate(29, months.ELUL, year - 1), // Erev Rosh Hashanah
      new HDate(9, months.TISHREI, year), // Erev Yom Kippur
      new HDate(14, months.IYYAR, year), // Pesach Sheini
  );
  return {
    none: none.map((hd) => hd.abs()).sort(),
    some: some.map((hd) => hd.abs()).sort(),
    yesPrev: yesPrev.map((hd) => hd.abs()).sort(),
  };
}
