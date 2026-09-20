/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Action_ReplyInputs */

const en_tickets_action_reply = /** @type {(inputs: Tickets_Action_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply`)
};

const es_tickets_action_reply = /** @type {(inputs: Tickets_Action_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responder`)
};

const en_xa2_tickets_action_reply = /** @type {(inputs: Tickets_Action_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèply ••⟧`)
};

/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Tickets_Action_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_action_reply = /** @type {((inputs?: Tickets_Action_ReplyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Action_ReplyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_action_reply(inputs)
	if (locale === "en-XA") return en_xa2_tickets_action_reply(inputs)
	return en_tickets_action_reply(inputs)
});