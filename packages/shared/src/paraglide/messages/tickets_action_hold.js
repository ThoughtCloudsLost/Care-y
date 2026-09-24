/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Action_HoldInputs */

const en_tickets_action_hold = /** @type {(inputs: Tickets_Action_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hold`)
};

const es_tickets_action_hold = /** @type {(inputs: Tickets_Action_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pausar`)
};

const en_xa2_tickets_action_hold = /** @type {(inputs: Tickets_Action_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòld ••⟧`)
};

/**
* | output |
* | --- |
* | "Hold" |
*
* @param {Tickets_Action_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_action_hold = /** @type {((inputs?: Tickets_Action_HoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Action_HoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_action_hold(inputs)
	if (locale === "en-XA") return en_xa2_tickets_action_hold(inputs)
	return en_tickets_action_hold(inputs)
});