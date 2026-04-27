/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Clear_FiltersInputs */

const en_ticket_clear_filters = /** @type {(inputs: Ticket_Clear_FiltersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear filters`)
};

const es_ticket_clear_filters = /** @type {(inputs: Ticket_Clear_FiltersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Limpiar filtros`)
};

/**
* | output |
* | --- |
* | "Clear filters" |
*
* @param {Ticket_Clear_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_clear_filters = /** @type {((inputs?: Ticket_Clear_FiltersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Clear_FiltersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_clear_filters(inputs)
	return es_ticket_clear_filters(inputs)
});