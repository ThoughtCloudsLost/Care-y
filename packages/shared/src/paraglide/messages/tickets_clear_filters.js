/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Clear_FiltersInputs */

const en_tickets_clear_filters = /** @type {(inputs: Tickets_Clear_FiltersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear all`)
};

const es_tickets_clear_filters = /** @type {(inputs: Tickets_Clear_FiltersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Borrar todos`)
};

/**
* | output |
* | --- |
* | "Clear all" |
*
* @param {Tickets_Clear_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_clear_filters = /** @type {((inputs?: Tickets_Clear_FiltersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Clear_FiltersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_clear_filters(inputs)
	return es_tickets_clear_filters(inputs)
});