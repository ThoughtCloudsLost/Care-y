/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_Client_PlaceholderInputs */

const en_ticket_new_field_client_placeholder = /** @type {(inputs: Ticket_New_Field_Client_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search by alias or phone`)
};

const es_ticket_new_field_client_placeholder = /** @type {(inputs: Ticket_New_Field_Client_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar por alias o telefono`)
};

/**
* | output |
* | --- |
* | "Search by alias or phone" |
*
* @param {Ticket_New_Field_Client_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_client_placeholder = /** @type {((inputs?: Ticket_New_Field_Client_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_Client_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_field_client_placeholder(inputs)
	return es_ticket_new_field_client_placeholder(inputs)
});