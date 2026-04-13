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

/**
* | output |
* | --- |
* | "Unwatch" |
*
* @param {Ticket_Action_UnwatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_unwatch = /** @type {((inputs?: Ticket_Action_UnwatchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_UnwatchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_unwatch(inputs)
	return es_ticket_action_unwatch(inputs)
});