/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Link_WarningInputs */

const en_ticket_tier_link_warning = /** @type {(inputs: Ticket_Tier_Link_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This link will not be shown again. Copy it or send it before closing.`)
};

const es_ticket_tier_link_warning = /** @type {(inputs: Ticket_Tier_Link_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este enlace no se mostrará de nuevo. Cópialo o envíalo antes de cerrar.`)
};

const en_xa2_ticket_tier_link_warning = /** @type {(inputs: Ticket_Tier_Link_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs lìnk wìll nòt bè shòwn àgàìn. Còpy ìt òr sènd ìt bèfòrè clòsìng. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This link will not be shown again. Copy it or send it before closing." |
*
* @param {Ticket_Tier_Link_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_link_warning = /** @type {((inputs?: Ticket_Tier_Link_WarningInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Link_WarningInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_link_warning(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_link_warning(inputs)
	return en_ticket_tier_link_warning(inputs)
});