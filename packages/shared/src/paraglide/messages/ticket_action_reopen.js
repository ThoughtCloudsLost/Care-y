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

const en_xa2_ticket_action_reopen = /** @type {(inputs: Ticket_Action_ReopenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèòpèn ••⟧`)
};

/**
* | output |
* | --- |
* | "Reopen" |
*
* @param {Ticket_Action_ReopenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_reopen = /** @type {((inputs?: Ticket_Action_ReopenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_ReopenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_reopen(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_reopen(inputs)
	return en_ticket_action_reopen(inputs)
});