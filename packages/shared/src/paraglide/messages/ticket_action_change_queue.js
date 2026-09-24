/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Ticket_Action_Change_QueueInputs */

const en_ticket_action_change_queue = /** @type {(inputs: Ticket_Action_Change_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Change ${i?.queue}`)
};

const es_ticket_action_change_queue = /** @type {(inputs: Ticket_Action_Change_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cambiar ${i?.queue}`)
};

const en_xa2_ticket_action_change_queue = /** @type {(inputs: Ticket_Action_Change_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Chàngè  •••${i?.queue}⟧`)
};

/**
* | output |
* | --- |
* | "Change {queue}" |
*
* @param {Ticket_Action_Change_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_change_queue = /** @type {((inputs: Ticket_Action_Change_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_Change_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_change_queue(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_change_queue(inputs)
	return en_ticket_action_change_queue(inputs)
});