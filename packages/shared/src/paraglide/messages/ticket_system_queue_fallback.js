/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Ticket_System_Queue_FallbackInputs */

const en_ticket_system_queue_fallback = /** @type {(inputs: Ticket_System_Queue_FallbackInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`another ${i?.queue}`)
};

const es_ticket_system_queue_fallback = /** @type {(inputs: Ticket_System_Queue_FallbackInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`otra ${i?.queue}`)
};

const en_xa2_ticket_system_queue_fallback = /** @type {(inputs: Ticket_System_Queue_FallbackInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦ànòthèr  •••${i?.queue}⟧`)
};

/**
* | output |
* | --- |
* | "another {queue}" |
*
* @param {Ticket_System_Queue_FallbackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_queue_fallback = /** @type {((inputs: Ticket_System_Queue_FallbackInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Queue_FallbackInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_system_queue_fallback(inputs)
	if (locale === "en-XA") return en_xa2_ticket_system_queue_fallback(inputs)
	return en_ticket_system_queue_fallback(inputs)
});