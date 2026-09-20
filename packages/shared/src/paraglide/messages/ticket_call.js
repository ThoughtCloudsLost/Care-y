/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_CallInputs */

const en_ticket_call = /** @type {(inputs: Ticket_CallInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Call ${i?.client}`)
};

const es_ticket_call = /** @type {(inputs: Ticket_CallInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Llamar al ${i?.client}`)
};

const en_xa2_ticket_call = /** @type {(inputs: Ticket_CallInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Càll  ••${i?.client}⟧`)
};

/**
* | output |
* | --- |
* | "Call {client}" |
*
* @param {Ticket_CallInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_call = /** @type {((inputs: Ticket_CallInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_CallInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_call(inputs)
	if (locale === "en-XA") return en_xa2_ticket_call(inputs)
	return en_ticket_call(inputs)
});