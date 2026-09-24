/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_New_Create_ClientInputs */

const en_ticket_new_create_client = /** @type {(inputs: Ticket_New_Create_ClientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create new ${i?.client}`)
};

const es_ticket_new_create_client = /** @type {(inputs: Ticket_New_Create_ClientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crear nuevo ${i?.client}`)
};

const en_xa2_ticket_new_create_client = /** @type {(inputs: Ticket_New_Create_ClientInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè nèw  ••••${i?.client}⟧`)
};

/**
* | output |
* | --- |
* | "Create new {client}" |
*
* @param {Ticket_New_Create_ClientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_create_client = /** @type {((inputs: Ticket_New_Create_ClientInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Create_ClientInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_create_client(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_create_client(inputs)
	return en_ticket_new_create_client(inputs)
});