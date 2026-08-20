/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_Tier_Passphrase_ExplainInputs */

const en_ticket_tier_passphrase_explain = /** @type {(inputs: Ticket_Tier_Passphrase_ExplainInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`A passphrase adds a second layer of protection. If someone else gets the link, they still cannot read the messages without the passphrase. Read the words to the ${i?.client} on the phone.`)
};

const es_ticket_tier_passphrase_explain = /** @type {(inputs: Ticket_Tier_Passphrase_ExplainInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Una frase de acceso agrega una segunda capa de protección. Si otra persona obtiene el enlace, no podrá leer los mensajes sin la frase. Lee las palabras al ${i?.client} por teléfono.`)
};

/**
* | output |
* | --- |
* | "A passphrase adds a second layer of protection. If someone else gets the link, they still cannot read the messages without the passphrase. Read the words to ..." |
*
* @param {Ticket_Tier_Passphrase_ExplainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_passphrase_explain = /** @type {((inputs: Ticket_Tier_Passphrase_ExplainInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Passphrase_ExplainInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_passphrase_explain(inputs)
	return es_ticket_tier_passphrase_explain(inputs)
});