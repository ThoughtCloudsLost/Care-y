/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_ClosedInputs */

const en_tickets_filter_closed = /** @type {(inputs: Tickets_Filter_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closed`)
};

const es_tickets_filter_closed = /** @type {(inputs: Tickets_Filter_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrados`)
};

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Tickets_Filter_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_closed = /** @type {((inputs?: Tickets_Filter_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_closed(inputs)
	return es_tickets_filter_closed(inputs)
});