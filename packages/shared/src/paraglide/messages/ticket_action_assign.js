/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_AssignInputs */

const en_ticket_action_assign = /** @type {(inputs: Ticket_Action_AssignInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assign`)
};

const es_ticket_action_assign = /** @type {(inputs: Ticket_Action_AssignInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignar`)
};

/**
* | output |
* | --- |
* | "Assign" |
*
* @param {Ticket_Action_AssignInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_assign = /** @type {((inputs?: Ticket_Action_AssignInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_AssignInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_assign(inputs)
	return es_ticket_action_assign(inputs)
});