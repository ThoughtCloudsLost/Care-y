/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, client: NonNullable<unknown> }} Client_No_TicketsInputs */

const en_client_no_tickets = /** @type {(inputs: Client_No_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No ${i?.tickets} for this ${i?.client}.`)
};

const es_client_no_tickets = /** @type {(inputs: Client_No_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No hay ${i?.tickets} para este ${i?.client}.`)
};

const en_xa2_client_no_tickets = /** @type {(inputs: Client_No_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nò  •${i?.tickets} fòr thìs  •••${i?.client}. •⟧`)
};

/**
* | output |
* | --- |
* | "No {tickets} for this {client}." |
*
* @param {Client_No_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_no_tickets = /** @type {((inputs: Client_No_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_No_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_no_tickets(inputs)
	if (locale === "en-XA") return en_xa2_client_no_tickets(inputs)
	return en_client_no_tickets(inputs)
});