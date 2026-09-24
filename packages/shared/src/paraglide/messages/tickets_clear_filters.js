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

const en_xa2_tickets_clear_filters = /** @type {(inputs: Tickets_Clear_FiltersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clèàr àll •••⟧`)
};

/**
* | output |
* | --- |
* | "Clear all" |
*
* @param {Tickets_Clear_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_clear_filters = /** @type {((inputs?: Tickets_Clear_FiltersInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Clear_FiltersInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_clear_filters(inputs)
	if (locale === "en-XA") return en_xa2_tickets_clear_filters(inputs)
	return en_tickets_clear_filters(inputs)
});