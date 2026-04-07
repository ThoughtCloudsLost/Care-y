/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Switch_To_ReplyInputs */

const en_ticket_switch_to_reply = /** @type {(inputs: Ticket_Switch_To_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switch to reply mode`)
};

const es_ticket_switch_to_reply = /** @type {(inputs: Ticket_Switch_To_ReplyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiar a modo respuesta`)
};

/**
* | output |
* | --- |
* | "Switch to reply mode" |
*
* @param {Ticket_Switch_To_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_switch_to_reply = /** @type {((inputs?: Ticket_Switch_To_ReplyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Switch_To_ReplyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_switch_to_reply(inputs)
	return es_ticket_switch_to_reply(inputs)
});