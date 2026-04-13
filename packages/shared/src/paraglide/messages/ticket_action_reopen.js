/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_ReopenInputs */

const en_ticket_action_reopen = /** @type {(inputs: Ticket_Action_ReopenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reopen`)
};

const es_ticket_action_reopen = /** @type {(inputs: Ticket_Action_ReopenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reabrir`)
};

/**
* | output |
* | --- |
* | "Reopen" |
*
* @param {Ticket_Action_ReopenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_reopen = /** @type {((inputs?: Ticket_Action_ReopenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_ReopenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_reopen(inputs)
	return es_ticket_action_reopen(inputs)
});