/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_ActiveInputs */

const en_tickets_filter_active = /** @type {(inputs: Tickets_Filter_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Active`)
};

const es_tickets_filter_active = /** @type {(inputs: Tickets_Filter_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activos`)
};

const en_xa2_tickets_filter_active = /** @type {(inputs: Tickets_Filter_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctìvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Active" |
*
* @param {Tickets_Filter_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_active = /** @type {((inputs?: Tickets_Filter_ActiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_ActiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_active(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_active(inputs)
	return en_tickets_filter_active(inputs)
});