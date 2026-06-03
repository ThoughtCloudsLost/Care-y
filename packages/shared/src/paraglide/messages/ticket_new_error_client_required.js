/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_New_Error_Client_RequiredInputs */

const en_ticket_new_error_client_required = /** @type {(inputs: Ticket_New_Error_Client_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Select or create a ${i?.client}`)
};

const es_ticket_new_error_client_required = /** @type {(inputs: Ticket_New_Error_Client_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Selecciona o crea un ${i?.client}`)
};

/**
* | output |
* | --- |
* | "Select or create a {client}" |
*
* @param {Ticket_New_Error_Client_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_client_required = /** @type {((inputs: Ticket_New_Error_Client_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Error_Client_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_error_client_required(inputs)
	return es_ticket_new_error_client_required(inputs)
});