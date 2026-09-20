/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_UnwatchInputs */

const en_ticket_action_unwatch = /** @type {(inputs: Ticket_Action_UnwatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unwatch`)
};

const es_ticket_action_unwatch = /** @type {(inputs: Ticket_Action_UnwatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dejar de observar`)
};

const en_xa2_ticket_action_unwatch = /** @type {(inputs: Ticket_Action_UnwatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnwàtch •••⟧`)
};

/**
* | output |
* | --- |
* | "Unwatch" |
*
* @param {Ticket_Action_UnwatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_unwatch = /** @type {((inputs?: Ticket_Action_UnwatchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_UnwatchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_unwatch(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_unwatch(inputs)
	return en_ticket_action_unwatch(inputs)
});