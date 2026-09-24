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

const en_xa2_ticket_email_error_record = /** @type {(inputs: Ticket_Email_Error_RecordInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl wàs dèlìvèrèd, bùt sàvìng ìt tò thè thrèàd fàìlèd. Tàp tò rètry sàvìng. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Email was delivered, but saving it to the thread failed. Tap to retry saving." |
*
* @param {Ticket_Email_Error_RecordInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_error_record = /** @type {((inputs?: Ticket_Email_Error_RecordInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Error_RecordInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_error_record(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_error_record(inputs)
	return en_ticket_email_error_record(inputs)
});