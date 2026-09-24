/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_UnholdInputs */

const en_ticket_action_unhold = /** @type {(inputs: Ticket_Action_UnholdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unhold`)
};

const es_ticket_action_unhold = /** @type {(inputs: Ticket_Action_UnholdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quitar espera`)
};

const en_xa2_ticket_action_unhold = /** @type {(inputs: Ticket_Action_UnholdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnhòld ••⟧`)
};

/**
* | output |
* | --- |
* | "Unhold" |
*
* @param {Ticket_Action_UnholdInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_unhold = /** @type {((inputs?: Ticket_Action_UnholdInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_UnholdInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_unhold(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_unhold(inputs)
	return en_ticket_action_unhold(inputs)
});