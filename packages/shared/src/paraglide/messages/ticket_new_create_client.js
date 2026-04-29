/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Create_ClientInputs */

const en_ticket_new_create_client = /** @type {(inputs: Ticket_New_Create_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create new client`)
};

const es_ticket_new_create_client = /** @type {(inputs: Ticket_New_Create_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear nuevo cliente`)
};

/**
* | output |
* | --- |
* | "Create new client" |
*
* @param {Ticket_New_Create_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_create_client = /** @type {((inputs?: Ticket_New_Create_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Create_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_create_client(inputs)
	return es_ticket_new_create_client(inputs)
});