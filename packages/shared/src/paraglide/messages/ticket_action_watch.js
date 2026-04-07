/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_WatchInputs */

const en_ticket_action_watch = /** @type {(inputs: Ticket_Action_WatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Watch`)
};

const es_ticket_action_watch = /** @type {(inputs: Ticket_Action_WatchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Observar`)
};

/**
* | output |
* | --- |
* | "Watch" |
*
* @param {Ticket_Action_WatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_watch = /** @type {((inputs?: Ticket_Action_WatchInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_WatchInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_watch(inputs)
	return es_ticket_action_watch(inputs)
});