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

/**
* | output |
* | --- |
* | "Hold" |
*
* @param {Ticket_Action_HoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_hold = /** @type {((inputs?: Ticket_Action_HoldInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_HoldInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_hold(inputs)
	return es_ticket_action_hold(inputs)
});