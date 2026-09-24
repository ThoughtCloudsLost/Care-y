/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_DoneInputs */

const en_ticket_tier_done = /** @type {(inputs: Ticket_Tier_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Done`)
};

const es_ticket_tier_done = /** @type {(inputs: Ticket_Tier_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Listo`)
};

const en_xa2_ticket_tier_done = /** @type {(inputs: Ticket_Tier_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònè ••⟧`)
};

/**
* | output |
* | --- |
* | "Done" |
*
* @param {Ticket_Tier_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_done = /** @type {((inputs?: Ticket_Tier_DoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_DoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_done(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_done(inputs)
	return en_ticket_tier_done(inputs)
});