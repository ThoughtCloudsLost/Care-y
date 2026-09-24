/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown>, ticket: NonNullable<unknown> }} Error_Ticket_Already_OpenInputs */

const en_error_ticket_already_open = /** @type {(inputs: Error_Ticket_Already_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This ${i?.client} already has an open ${i?.ticket}.`)
};

const es_error_ticket_already_open = /** @type {(inputs: Error_Ticket_Already_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este ${i?.client} ya tiene un ${i?.ticket} abierto.`)
};

const en_xa2_error_ticket_already_open = /** @type {(inputs: Error_Ticket_Already_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs  ••${i?.client} àlrèàdy hàs àn òpèn  •••••••${i?.ticket}. •⟧`)
};

/**
* | output |
* | --- |
* | "This {client} already has an open {ticket}." |
*
* @param {Error_Ticket_Already_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_ticket_already_open = /** @type {((inputs: Error_Ticket_Already_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Already_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_ticket_already_open(inputs)
	if (locale === "en-XA") return en_xa2_error_ticket_already_open(inputs)
	return en_error_ticket_already_open(inputs)
});