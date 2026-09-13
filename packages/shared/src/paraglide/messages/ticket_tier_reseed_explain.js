/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Reseed_ExplainInputs */

const en_ticket_tier_reseed_explain = /** @type {(inputs: Ticket_Tier_Reseed_ExplainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Past conversations will become visible in the client's new secure link.`)
};

const es_ticket_tier_reseed_explain = /** @type {(inputs: Ticket_Tier_Reseed_ExplainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las conversaciones anteriores se harán visibles en el nuevo enlace seguro del cliente.`)
};

/**
* | output |
* | --- |
* | "Past conversations will become visible in the client's new secure link." |
*
* @param {Ticket_Tier_Reseed_ExplainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_reseed_explain = /** @type {((inputs?: Ticket_Tier_Reseed_ExplainInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Reseed_ExplainInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_reseed_explain(inputs)
	return es_ticket_tier_reseed_explain(inputs)
});