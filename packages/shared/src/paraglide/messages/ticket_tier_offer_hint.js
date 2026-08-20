/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_Tier_Offer_HintInputs */

const en_ticket_tier_offer_hint = /** @type {(inputs: Ticket_Tier_Offer_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`The ${i?.client} will see an option to create a password-protected account on their portal page.`)
};

const es_ticket_tier_offer_hint = /** @type {(inputs: Ticket_Tier_Offer_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El ${i?.client} verá la opción de crear una cuenta protegida con contraseña en su página del portal.`)
};

/**
* | output |
* | --- |
* | "The {client} will see an option to create a password-protected account on their portal page." |
*
* @param {Ticket_Tier_Offer_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_offer_hint = /** @type {((inputs: Ticket_Tier_Offer_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Offer_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_offer_hint(inputs)
	return es_ticket_tier_offer_hint(inputs)
});