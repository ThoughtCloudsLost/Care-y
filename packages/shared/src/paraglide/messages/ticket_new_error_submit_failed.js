/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Error_Submit_FailedInputs */

const en_ticket_new_error_submit_failed = /** @type {(inputs: Ticket_New_Error_Submit_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not create ticket. Try again.`)
};

const es_ticket_new_error_submit_failed = /** @type {(inputs: Ticket_New_Error_Submit_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo crear el ticket. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Could not create ticket. Try again." |
*
* @param {Ticket_New_Error_Submit_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_submit_failed = /** @type {((inputs?: Ticket_New_Error_Submit_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Error_Submit_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_error_submit_failed(inputs)
	return es_ticket_new_error_submit_failed(inputs)
});