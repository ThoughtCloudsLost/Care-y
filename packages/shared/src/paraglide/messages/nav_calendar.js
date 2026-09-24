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

const en_xa2_nav_calendar = /** @type {(inputs: Nav_CalendarInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càlèndàr •••⟧`)
};

/**
* | output |
* | --- |
* | "Calendar" |
*
* @param {Nav_CalendarInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_calendar = /** @type {((inputs?: Nav_CalendarInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_CalendarInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_calendar(inputs)
	if (locale === "en-XA") return en_xa2_nav_calendar(inputs)
	return en_nav_calendar(inputs)
});