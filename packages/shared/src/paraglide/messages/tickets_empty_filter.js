/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, ticket: NonNullable<unknown> }} Tickets_Empty_FilterInputs */

const en_tickets_empty_filter = /** @type {(inputs: Tickets_Empty_FilterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No ${i?.tickets} match this filter.`)
};

const es_tickets_empty_filter = /** @type {(inputs: Tickets_Empty_FilterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ningún ${i?.ticket} coincide con este filtro.`)
};

/**
* | output |
* | --- |
* | "No {tickets} match this filter." |
*
* @param {Tickets_Empty_FilterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_empty_filter = /** @type {((inputs: Tickets_Empty_FilterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Empty_FilterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_empty_filter(inputs)
	return es_tickets_empty_filter(inputs)
});