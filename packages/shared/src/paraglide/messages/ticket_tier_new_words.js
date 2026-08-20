/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_New_WordsInputs */

const en_ticket_tier_new_words = /** @type {(inputs: Ticket_Tier_New_WordsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New words`)
};

const es_ticket_tier_new_words = /** @type {(inputs: Ticket_Tier_New_WordsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevas palabras`)
};

/**
* | output |
* | --- |
* | "New words" |
*
* @param {Ticket_Tier_New_WordsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_new_words = /** @type {((inputs?: Ticket_Tier_New_WordsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_New_WordsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_new_words(inputs)
	return es_ticket_tier_new_words(inputs)
});