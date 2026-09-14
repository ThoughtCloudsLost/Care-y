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

/**
* | output |
* | --- |
* | "Change priority" |
*
* @param {Ticket_Action_Change_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_change_priority = /** @type {((inputs?: Ticket_Action_Change_PriorityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_Change_PriorityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_change_priority(inputs)
	return en_ticket_action_change_priority(inputs)
});