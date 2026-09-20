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

const en_xa2_ticket_action_take = /** @type {(inputs: Ticket_Action_TakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàkè ••⟧`)
};

/**
* | output |
* | --- |
* | "Take" |
*
* @param {Ticket_Action_TakeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_take = /** @type {((inputs?: Ticket_Action_TakeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Action_TakeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_action_take(inputs)
	if (locale === "en-XA") return en_xa2_ticket_action_take(inputs)
	return en_ticket_action_take(inputs)
});