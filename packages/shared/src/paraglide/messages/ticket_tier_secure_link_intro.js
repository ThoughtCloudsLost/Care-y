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

const en_xa2_ticket_tier_secure_link_intro = /** @type {(inputs: Ticket_Tier_Secure_Link_IntroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtès à prìvàtè pàgè whèrè thèy càn rèàd ànd sènd mèssàgès. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Creates a private page where they can read and send messages." |
*
* @param {Ticket_Tier_Secure_Link_IntroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_secure_link_intro = /** @type {((inputs?: Ticket_Tier_Secure_Link_IntroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Secure_Link_IntroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_secure_link_intro(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_secure_link_intro(inputs)
	return en_ticket_tier_secure_link_intro(inputs)
});