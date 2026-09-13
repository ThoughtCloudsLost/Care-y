/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_RegenerateInputs */

const en_ticket_tier_regenerate = /** @type {(inputs: Ticket_Tier_RegenerateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate new link`)
};

const es_ticket_tier_regenerate = /** @type {(inputs: Ticket_Tier_RegenerateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generar enlace nuevo`)
};

/**
* | output |
* | --- |
* | "Generate new link" |
*
* @param {Ticket_Tier_RegenerateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_regenerate = /** @type {((inputs?: Ticket_Tier_RegenerateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_RegenerateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_regenerate(inputs)
	return es_ticket_tier_regenerate(inputs)
});