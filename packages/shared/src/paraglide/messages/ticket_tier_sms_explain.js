/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Sms_ExplainInputs */

const en_ticket_tier_sms_explain = /** @type {(inputs: Ticket_Tier_Sms_ExplainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Replies go out as regular text messages.`)
};

const es_ticket_tier_sms_explain = /** @type {(inputs: Ticket_Tier_Sms_ExplainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las respuestas se envían como mensajes de texto regulares.`)
};

/**
* | output |
* | --- |
* | "Replies go out as regular text messages." |
*
* @param {Ticket_Tier_Sms_ExplainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_sms_explain = /** @type {((inputs?: Ticket_Tier_Sms_ExplainInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Sms_ExplainInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_sms_explain(inputs)
	return es_ticket_tier_sms_explain(inputs)
});