/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Hidden_OneInputs */

const en_ticket_filter_hidden_one = /** @type {(inputs: Ticket_Filter_Hidden_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 filtered message`)
};

const es_ticket_filter_hidden_one = /** @type {(inputs: Ticket_Filter_Hidden_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 mensaje filtrado`)
};

/**
* | output |
* | --- |
* | "1 filtered message" |
*
* @param {Ticket_Filter_Hidden_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_hidden_one = /** @type {((inputs?: Ticket_Filter_Hidden_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Hidden_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_hidden_one(inputs)
	return es_ticket_filter_hidden_one(inputs)
});