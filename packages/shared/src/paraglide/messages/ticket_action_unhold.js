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

/**
* | output |
* | --- |
* | "Unhold" |
*
* @param {Ticket_Action_UnholdInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_unhold = /** @type {((inputs?: Ticket_Action_UnholdInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_UnholdInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_unhold(inputs)
	return es_ticket_action_unhold(inputs)
});