/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Action_CallInputs */

const en_tickets_action_call = /** @type {(inputs: Tickets_Action_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call`)
};

const es_tickets_action_call = /** @type {(inputs: Tickets_Action_CallInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamar`)
};

/**
* | output |
* | --- |
* | "Call" |
*
* @param {Tickets_Action_CallInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_call = /** @type {((inputs?: Tickets_Action_CallInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Action_CallInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_action_call(inputs)
	return es_tickets_action_call(inputs)
});