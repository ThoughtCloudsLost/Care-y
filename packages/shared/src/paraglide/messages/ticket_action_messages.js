/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_MessagesInputs */

const en_ticket_action_messages = /** @type {(inputs: Ticket_Action_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View messages`)
};

const es_ticket_action_messages = /** @type {(inputs: Ticket_Action_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver mensajes`)
};

/**
* | output |
* | --- |
* | "View messages" |
*
* @param {Ticket_Action_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_messages = /** @type {((inputs?: Ticket_Action_MessagesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_MessagesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_messages(inputs)
	return es_ticket_action_messages(inputs)
});