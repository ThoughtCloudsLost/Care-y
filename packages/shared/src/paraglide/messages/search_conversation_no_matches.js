/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Conversation_No_MatchesInputs */

const en_search_conversation_no_matches = /** @type {(inputs: Search_Conversation_No_MatchesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No matches in this conversation`)
};

const es_search_conversation_no_matches = /** @type {(inputs: Search_Conversation_No_MatchesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin coincidencias en esta conversacion`)
};

/**
* | output |
* | --- |
* | "No matches in this conversation" |
*
* @param {Search_Conversation_No_MatchesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_no_matches = /** @type {((inputs?: Search_Conversation_No_MatchesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_No_MatchesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_conversation_no_matches(inputs)
	return es_search_conversation_no_matches(inputs)
});