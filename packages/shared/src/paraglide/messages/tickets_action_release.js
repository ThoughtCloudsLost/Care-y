/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Action_ReleaseInputs */

const en_tickets_action_release = /** @type {(inputs: Tickets_Action_ReleaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Release`)
};

const es_tickets_action_release = /** @type {(inputs: Tickets_Action_ReleaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Soltar`)
};

/**
* | output |
* | --- |
* | "Release" |
*
* @param {Tickets_Action_ReleaseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_action_release = /** @type {((inputs?: Tickets_Action_ReleaseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Action_ReleaseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_action_release(inputs)
	return es_tickets_action_release(inputs)
});