/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, Ticket: NonNullable<unknown> }} Dashboard_Encrypted_TicketInputs */

const en_dashboard_encrypted_ticket = /** @type {(inputs: Dashboard_Encrypted_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Encrypted ${i?.ticket}`)
};

const es_dashboard_encrypted_ticket = /** @type {(inputs: Dashboard_Encrypted_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} cifrado`)
};

/**
* | output |
* | --- |
* | "Encrypted {ticket}" |
*
* @param {Dashboard_Encrypted_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_ticket = /** @type {((inputs: Dashboard_Encrypted_TicketInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Encrypted_TicketInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_encrypted_ticket(inputs)
	return es_dashboard_encrypted_ticket(inputs)
});