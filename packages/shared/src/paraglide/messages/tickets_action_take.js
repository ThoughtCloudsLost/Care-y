/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Action_TakeInputs */

const en_tickets_action_take = /** @type {(inputs: Tickets_Action_TakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Take`)
};

const es_tickets_action_take = /** @type {(inputs: Tickets_Action_TakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tomar`)
};

/**
* | output |
* | --- |
* | "Take" |
*
* @param {Tickets_Action_TakeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_take = /** @type {((inputs?: Tickets_Action_TakeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Action_TakeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_action_take(inputs)
	return es_tickets_action_take(inputs)
});