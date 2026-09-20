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

const en_xa2_ticket_action_assign = /** @type {(inputs: Ticket_Action_AssignInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgn ••⟧`)
};

/**
* | output |
* | --- |
* | "Assign" |
*
* @param {Ticket_Action_AssignInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_assign = /** @type {((inputs?: Ticket_Action_AssignInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_AssignInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_assign(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_assign(inputs)
	return en_ticket_action_assign(inputs)
});