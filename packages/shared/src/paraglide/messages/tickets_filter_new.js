/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_NewInputs */

const en_tickets_filter_new = /** @type {(inputs: Tickets_Filter_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New`)
};

const es_tickets_filter_new = /** @type {(inputs: Tickets_Filter_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevos`)
};

const en_xa2_tickets_filter_new = /** @type {(inputs: Tickets_Filter_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw •⟧`)
};

/**
* | output |
* | --- |
* | "New" |
*
* @param {Tickets_Filter_NewInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_new = /** @type {((inputs?: Tickets_Filter_NewInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_NewInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_new(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_new(inputs)
	return en_tickets_filter_new(inputs)
});