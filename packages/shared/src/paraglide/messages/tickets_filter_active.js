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

/**
* | output |
* | --- |
* | "Active" |
*
* @param {Tickets_Filter_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_active = /** @type {((inputs?: Tickets_Filter_ActiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_ActiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_active(inputs)
	return es_tickets_filter_active(inputs)
});