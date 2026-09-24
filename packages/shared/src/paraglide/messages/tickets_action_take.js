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

const en_xa2_tickets_action_take = /** @type {(inputs: Tickets_Action_TakeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàkè ••⟧`)
};

/**
* | output |
* | --- |
* | "Take" |
*
* @param {Tickets_Action_TakeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_action_take = /** @type {((inputs?: Tickets_Action_TakeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Action_TakeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_action_take(inputs)
	if (locale === "en-XA") return en_xa2_tickets_action_take(inputs)
	return en_tickets_action_take(inputs)
});