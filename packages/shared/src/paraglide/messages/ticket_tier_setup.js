/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_SetupInputs */

const en_ticket_tier_setup = /** @type {(inputs: Ticket_Tier_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up Secure Link`)
};

const es_ticket_tier_setup = /** @type {(inputs: Ticket_Tier_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar enlace seguro`)
};

/**
* | output |
* | --- |
* | "Set up Secure Link" |
*
* @param {Ticket_Tier_SetupInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_setup = /** @type {((inputs?: Ticket_Tier_SetupInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_SetupInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_setup(inputs)
	return es_ticket_tier_setup(inputs)
});