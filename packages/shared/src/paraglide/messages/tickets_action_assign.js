/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Action_AssignInputs */

const en_tickets_action_assign = /** @type {(inputs: Tickets_Action_AssignInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assign`)
};

const es_tickets_action_assign = /** @type {(inputs: Tickets_Action_AssignInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asignar`)
};

const en_xa2_tickets_action_assign = /** @type {(inputs: Tickets_Action_AssignInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgn ••⟧`)
};

/**
* | output |
* | --- |
* | "Assign" |
*
* @param {Tickets_Action_AssignInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_action_assign = /** @type {((inputs?: Tickets_Action_AssignInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Action_AssignInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_action_assign(inputs)
	if (locale === "en-XA") return en_xa2_tickets_action_assign(inputs)
	return en_tickets_action_assign(inputs)
});