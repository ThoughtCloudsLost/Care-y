/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_Error_RecordInputs */

const en_ticket_email_error_record = /** @type {(inputs: Ticket_Email_Error_RecordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email was delivered, but saving it to the thread failed. Tap to retry saving.`)
};

const es_ticket_email_error_record = /** @type {(inputs: Ticket_Email_Error_RecordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El correo se entregó, pero no se pudo guardar en el hilo. Toca para reintentar.`)
};

/**
* | output |
* | --- |
* | "Email was delivered, but saving it to the thread failed. Tap to retry saving." |
*
* @param {Ticket_Email_Error_RecordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_error_record = /** @type {((inputs?: Ticket_Email_Error_RecordInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Error_RecordInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_error_record(inputs)
	return en_ticket_email_error_record(inputs)
});