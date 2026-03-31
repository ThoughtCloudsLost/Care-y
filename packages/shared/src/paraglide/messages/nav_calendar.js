/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_CalendarInputs */

const en_nav_calendar = /** @type {(inputs: Nav_CalendarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Calendar`)
};

const es_nav_calendar = /** @type {(inputs: Nav_CalendarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Calendario`)
};

/**
* | output |
* | --- |
* | "Calendar" |
*
* @param {Nav_CalendarInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_calendar = /** @type {((inputs?: Nav_CalendarInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_CalendarInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_calendar(inputs)
	return es_nav_calendar(inputs)
});