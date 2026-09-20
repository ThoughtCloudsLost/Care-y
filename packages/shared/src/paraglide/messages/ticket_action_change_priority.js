/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_Change_PriorityInputs */

const en_ticket_action_change_priority = /** @type {(inputs: Ticket_Action_Change_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Change priority`)
};

const es_ticket_action_change_priority = /** @type {(inputs: Ticket_Action_Change_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar prioridad`)
};

const en_xa2_ticket_action_change_priority = /** @type {(inputs: Ticket_Action_Change_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chàngè prìòrìty •••••⟧`)
};

/**
* | output |
* | --- |
* | "Change priority" |
*
* @param {Ticket_Action_Change_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_change_priority = /** @type {((inputs?: Ticket_Action_Change_PriorityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_Change_PriorityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_change_priority(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_change_priority(inputs)
	return en_ticket_action_change_priority(inputs)
});