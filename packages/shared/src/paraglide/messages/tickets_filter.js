/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Tickets_FilterInputs */

const en_tickets_filter = /** @type {(inputs: Tickets_FilterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Filter ${i?.tickets}`)
};

const es_tickets_filter = /** @type {(inputs: Tickets_FilterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Filtrar ${i?.tickets}`)
};

const en_xa2_tickets_filter = /** @type {(inputs: Tickets_FilterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Fìltèr  •••${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Filter {tickets}" |
*
* @param {Tickets_FilterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter = /** @type {((inputs: Tickets_FilterInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_FilterInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter(inputs)
	return en_tickets_filter(inputs)
});