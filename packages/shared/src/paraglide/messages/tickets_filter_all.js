/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_AllInputs */

const en_tickets_filter_all = /** @type {(inputs: Tickets_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All`)
};

const es_tickets_filter_all = /** @type {(inputs: Tickets_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos`)
};

const en_xa2_tickets_filter_all = /** @type {(inputs: Tickets_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll •⟧`)
};

/**
* | output |
* | --- |
* | "All" |
*
* @param {Tickets_Filter_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_all = /** @type {((inputs?: Tickets_Filter_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_all(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_all(inputs)
	return en_tickets_filter_all(inputs)
});