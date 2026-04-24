/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Conversation_PreviousInputs */

const en_search_conversation_previous = /** @type {(inputs: Search_Conversation_PreviousInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Previous match`)
};

const es_search_conversation_previous = /** @type {(inputs: Search_Conversation_PreviousInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coincidencia anterior`)
};

/**
* | output |
* | --- |
* | "Previous match" |
*
* @param {Search_Conversation_PreviousInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_previous = /** @type {((inputs?: Search_Conversation_PreviousInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_PreviousInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_conversation_previous(inputs)
	return es_search_conversation_previous(inputs)
});