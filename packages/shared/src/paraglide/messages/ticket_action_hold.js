/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_HoldInputs */

const en_ticket_action_hold = /** @type {(inputs: Ticket_Action_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hold`)
};

const es_ticket_action_hold = /** @type {(inputs: Ticket_Action_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En espera`)
};

const en_xa2_ticket_action_hold = /** @type {(inputs: Ticket_Action_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòld ••⟧`)
};

/**
* | output |
* | --- |
* | "Hold" |
*
* @param {Ticket_Action_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_hold = /** @type {((inputs?: Ticket_Action_HoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_HoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_hold(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_hold(inputs)
	return en_ticket_action_hold(inputs)
});