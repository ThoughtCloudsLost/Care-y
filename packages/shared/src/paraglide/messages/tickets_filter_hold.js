/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_HoldInputs */

const en_tickets_filter_hold = /** @type {(inputs: Tickets_Filter_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On Hold`)
};

const es_tickets_filter_hold = /** @type {(inputs: Tickets_Filter_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En espera`)
};

/**
* | output |
* | --- |
* | "On Hold" |
*
* @param {Tickets_Filter_HoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_hold = /** @type {((inputs?: Tickets_Filter_HoldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_HoldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_hold(inputs)
	return es_tickets_filter_hold(inputs)
});