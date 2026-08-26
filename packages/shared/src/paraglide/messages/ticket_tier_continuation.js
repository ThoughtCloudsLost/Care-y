/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_ContinuationInputs */

const en_ticket_tier_continuation = /** @type {(inputs: Ticket_Tier_ContinuationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continuation Link`)
};

const es_ticket_tier_continuation = /** @type {(inputs: Ticket_Tier_ContinuationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace de continuación`)
};

/**
* | output |
* | --- |
* | "Continuation Link" |
*
* @param {Ticket_Tier_ContinuationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_continuation = /** @type {((inputs?: Ticket_Tier_ContinuationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_ContinuationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_continuation(inputs)
	return es_ticket_tier_continuation(inputs)
});