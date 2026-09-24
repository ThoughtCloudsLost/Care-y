/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, Ticket: NonNullable<unknown> }} Dashboard_Encrypted_TicketInputs */

const en_dashboard_encrypted_ticket = /** @type {(inputs: Dashboard_Encrypted_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Locked ${i?.ticket}`)
};

const es_dashboard_encrypted_ticket = /** @type {(inputs: Dashboard_Encrypted_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} bloqueado`)
};

const en_xa2_dashboard_encrypted_ticket = /** @type {(inputs: Dashboard_Encrypted_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Lòckèd  •••${i?.ticket}⟧`)
};

/**
* | output |
* | --- |
* | "Locked {ticket}" |
*
* @param {Dashboard_Encrypted_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_ticket = /** @type {((inputs: Dashboard_Encrypted_TicketInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Encrypted_TicketInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_encrypted_ticket(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_encrypted_ticket(inputs)
	return en_dashboard_encrypted_ticket(inputs)
});