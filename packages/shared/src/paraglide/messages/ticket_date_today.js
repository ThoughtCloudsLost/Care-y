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

const en_xa2_ticket_date_today = /** @type {(inputs: Ticket_Date_TodayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tòdày ••⟧`)
};

/**
* | output |
* | --- |
* | "Today" |
*
* @param {Ticket_Date_TodayInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_date_today = /** @type {((inputs?: Ticket_Date_TodayInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Date_TodayInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_date_today(inputs)
	if (locale === "en-XA") return en_xa2_ticket_date_today(inputs)
	return en_ticket_date_today(inputs)
});