/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, alias: NonNullable<unknown> }} Tickets_OpenInputs */

const en_tickets_open = /** @type {(inputs: Tickets_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Open ${i?.ticket} ${i?.alias}`)
};

const es_tickets_open = /** @type {(inputs: Tickets_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Abrir ${i?.ticket} ${i?.alias}`)
};

/**
* | output |
* | --- |
* | "Open {ticket} {alias}" |
*
* @param {Tickets_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_open = /** @type {((inputs: Tickets_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_open(inputs)
	return es_tickets_open(inputs)
});