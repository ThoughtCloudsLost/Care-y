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

const en_xa2_ticket_tier_continuation = /** @type {(inputs: Ticket_Tier_ContinuationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntìnùàtìòn Lìnk ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Continuation Link" |
*
* @param {Ticket_Tier_ContinuationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_continuation = /** @type {((inputs?: Ticket_Tier_ContinuationInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_ContinuationInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_continuation(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_continuation(inputs)
	return en_ticket_tier_continuation(inputs)
});