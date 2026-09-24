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

const en_xa2_ticket_reply_error_send = /** @type {(inputs: Ticket_Reply_Error_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèply fàìlèd tò sènd. Tàp tò rètry. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reply failed to send. Tap to retry." |
*
* @param {Ticket_Reply_Error_SendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_error_send = /** @type {((inputs?: Ticket_Reply_Error_SendInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Error_SendInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_reply_error_send(inputs)
	if (locale === "en-XA") return en_xa2_ticket_reply_error_send(inputs)
	return en_ticket_reply_error_send(inputs)
});