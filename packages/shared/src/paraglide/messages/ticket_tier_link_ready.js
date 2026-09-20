/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Link_ReadyInputs */

const en_ticket_tier_link_ready = /** @type {(inputs: Ticket_Tier_Link_ReadyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link ready. Send it now or copy it.`)
};

const es_ticket_tier_link_ready = /** @type {(inputs: Ticket_Tier_Link_ReadyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace listo. Envíalo ahora o cópialo.`)
};

const en_xa2_ticket_tier_link_ready = /** @type {(inputs: Ticket_Tier_Link_ReadyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk rèàdy. Sènd ìt nòw òr còpy ìt. •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Link ready. Send it now or copy it." |
*
* @param {Ticket_Tier_Link_ReadyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_link_ready = /** @type {((inputs?: Ticket_Tier_Link_ReadyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Link_ReadyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_link_ready(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_link_ready(inputs)
	return en_ticket_tier_link_ready(inputs)
});