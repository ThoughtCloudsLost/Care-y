/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_No_Filter_ResultsInputs */

const en_ticket_no_filter_results = /** @type {(inputs: Ticket_No_Filter_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No messages match your filters`)
};

const es_ticket_no_filter_results = /** @type {(inputs: Ticket_No_Filter_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningun mensaje coincide con tus filtros`)
};

/**
* | output |
* | --- |
* | "No messages match your filters" |
*
* @param {Ticket_No_Filter_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_no_filter_results = /** @type {((inputs?: Ticket_No_Filter_ResultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_No_Filter_ResultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_no_filter_results(inputs)
	return es_ticket_no_filter_results(inputs)
});