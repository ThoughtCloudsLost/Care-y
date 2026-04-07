/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Date_TodayInputs */

const en_ticket_date_today = /** @type {(inputs: Ticket_Date_TodayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Today`)
};

const es_ticket_date_today = /** @type {(inputs: Ticket_Date_TodayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hoy`)
};

/**
* | output |
* | --- |
* | "Today" |
*
* @param {Ticket_Date_TodayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_date_today = /** @type {((inputs?: Ticket_Date_TodayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Date_TodayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_date_today(inputs)
	return es_ticket_date_today(inputs)
});