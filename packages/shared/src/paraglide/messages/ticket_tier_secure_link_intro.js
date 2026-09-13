/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Secure_Link_IntroInputs */

const en_ticket_tier_secure_link_intro = /** @type {(inputs: Ticket_Tier_Secure_Link_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creates a private page where they can read and send messages.`)
};

const es_ticket_tier_secure_link_intro = /** @type {(inputs: Ticket_Tier_Secure_Link_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crea una página privada donde pueden leer y enviar mensajes.`)
};

/**
* | output |
* | --- |
* | "Creates a private page where they can read and send messages." |
*
* @param {Ticket_Tier_Secure_Link_IntroInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_secure_link_intro = /** @type {((inputs?: Ticket_Tier_Secure_Link_IntroInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Secure_Link_IntroInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_secure_link_intro(inputs)
	return es_ticket_tier_secure_link_intro(inputs)
});