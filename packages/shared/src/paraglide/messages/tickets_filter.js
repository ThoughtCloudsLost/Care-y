/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_FilterInputs */

const en_tickets_filter = /** @type {(inputs: Tickets_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter tickets`)
};

const es_tickets_filter = /** @type {(inputs: Tickets_FilterInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtrar tickets`)
};

/**
* | output |
* | --- |
* | "Filter tickets" |
*
* @param {Tickets_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter = /** @type {((inputs?: Tickets_FilterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_FilterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter(inputs)
	return es_tickets_filter(inputs)
});