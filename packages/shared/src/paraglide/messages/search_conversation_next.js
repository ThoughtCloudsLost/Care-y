/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Conversation_NextInputs */

const en_search_conversation_next = /** @type {(inputs: Search_Conversation_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Next match`)
};

const es_search_conversation_next = /** @type {(inputs: Search_Conversation_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Siguiente coincidencia`)
};

const en_xa2_search_conversation_next = /** @type {(inputs: Search_Conversation_NextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèxt màtch •••⟧`)
};

/**
* | output |
* | --- |
* | "Next match" |
*
* @param {Search_Conversation_NextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_next = /** @type {((inputs?: Search_Conversation_NextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_NextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_conversation_next(inputs)
	if (locale === "en-XA") return en_xa2_search_conversation_next(inputs)
	return en_search_conversation_next(inputs)
});