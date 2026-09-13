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

/**
* | output |
* | --- |
* | "Link ready. Send it now or copy it." |
*
* @param {Ticket_Tier_Link_ReadyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_link_ready = /** @type {((inputs?: Ticket_Tier_Link_ReadyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Link_ReadyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_link_ready(inputs)
	return es_ticket_tier_link_ready(inputs)
});