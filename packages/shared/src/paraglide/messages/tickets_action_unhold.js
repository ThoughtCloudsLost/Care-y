/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Action_UnholdInputs */

const en_tickets_action_unhold = /** @type {(inputs: Tickets_Action_UnholdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unhold`)
};

const es_tickets_action_unhold = /** @type {(inputs: Tickets_Action_UnholdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reanudar`)
};

/**
* | output |
* | --- |
* | "Unhold" |
*
* @param {Tickets_Action_UnholdInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_unhold = /** @type {((inputs?: Tickets_Action_UnholdInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Action_UnholdInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_action_unhold(inputs)
	return es_tickets_action_unhold(inputs)
});