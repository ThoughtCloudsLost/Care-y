/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Action_TakeInputs */

const en_ticket_action_take = /** @type {(inputs: Ticket_Action_TakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Take`)
};

const es_ticket_action_take = /** @type {(inputs: Ticket_Action_TakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tomar`)
};

/**
* | output |
* | --- |
* | "Take" |
*
* @param {Ticket_Action_TakeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_take = /** @type {((inputs?: Ticket_Action_TakeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_TakeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_action_take(inputs)
	return es_ticket_action_take(inputs)
});