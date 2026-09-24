/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Create_New_TicketInputs */

const en_create_new_ticket = /** @type {(inputs: Create_New_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`New ${i?.Ticket}`)
};

const es_create_new_ticket = /** @type {(inputs: Create_New_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nuevo ${i?.Ticket}`)
};

const en_xa2_create_new_ticket = /** @type {(inputs: Create_New_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nèw  ••${i?.Ticket}⟧`)
};

/**
* | output |
* | --- |
* | "New {Ticket}" |
*
* @param {Create_New_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_new_ticket = /** @type {((inputs: Create_New_TicketInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_New_TicketInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_create_new_ticket(inputs)
	if (locale === "en-XA") return en_xa2_create_new_ticket(inputs)
	return en_create_new_ticket(inputs)
});