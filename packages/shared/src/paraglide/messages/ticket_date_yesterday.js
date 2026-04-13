/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Date_YesterdayInputs */

const en_ticket_date_yesterday = /** @type {(inputs: Ticket_Date_YesterdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Yesterday`)
};

const es_ticket_date_yesterday = /** @type {(inputs: Ticket_Date_YesterdayInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ayer`)
};

/**
* | output |
* | --- |
* | "Yesterday" |
*
* @param {Ticket_Date_YesterdayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_date_yesterday = /** @type {((inputs?: Ticket_Date_YesterdayInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Date_YesterdayInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_date_yesterday(inputs)
	return es_ticket_date_yesterday(inputs)
});