/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ clients: NonNullable<unknown> }} Ticket_New_Error_Phone_RequiredInputs */

const en_ticket_new_error_phone_required = /** @type {(inputs: Ticket_New_Error_Phone_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Phone number is required for new ${i?.clients}`)
};

const es_ticket_new_error_phone_required = /** @type {(inputs: Ticket_New_Error_Phone_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El numero de telefono es obligatorio para nuevos ${i?.clients}`)
};

/**
* | output |
* | --- |
* | "Phone number is required for new {clients}" |
*
* @param {Ticket_New_Error_Phone_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_phone_required = /** @type {((inputs: Ticket_New_Error_Phone_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Error_Phone_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_error_phone_required(inputs)
	return es_ticket_new_error_phone_required(inputs)
});