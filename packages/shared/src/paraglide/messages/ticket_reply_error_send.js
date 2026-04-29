/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Reply_Error_SendInputs */

const en_ticket_reply_error_send = /** @type {(inputs: Ticket_Reply_Error_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply failed to send. Tap to retry.`)
};

const es_ticket_reply_error_send = /** @type {(inputs: Ticket_Reply_Error_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo enviar la respuesta. Toca para reintentar.`)
};

/**
* | output |
* | --- |
* | "Reply failed to send. Tap to retry." |
*
* @param {Ticket_Reply_Error_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_error_send = /** @type {((inputs?: Ticket_Reply_Error_SendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Error_SendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_reply_error_send(inputs)
	return es_ticket_reply_error_send(inputs)
});