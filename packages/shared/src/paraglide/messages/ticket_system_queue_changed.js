/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queueName: NonNullable<unknown> }} Ticket_System_Queue_ChangedInputs */

const en_ticket_system_queue_changed = /** @type {(inputs: Ticket_System_Queue_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Moved to ${i?.queueName}`)
};

const es_ticket_system_queue_changed = /** @type {(inputs: Ticket_System_Queue_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Movido a ${i?.queueName}`)
};

const en_xa2_ticket_system_queue_changed = /** @type {(inputs: Ticket_System_Queue_ChangedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Mòvèd tò  •••${i?.queueName}⟧`)
};

/**
* | output |
* | --- |
* | "Moved to {queueName}" |
*
* @param {Ticket_System_Queue_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_system_queue_changed = /** @type {((inputs: Ticket_System_Queue_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_System_Queue_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_system_queue_changed(inputs)
	if (locale === "en-XA") return en_xa2_ticket_system_queue_changed(inputs)
	return en_ticket_system_queue_changed(inputs)
});