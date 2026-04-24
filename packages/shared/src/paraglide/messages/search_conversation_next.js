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

/**
* | output |
* | --- |
* | "Next match" |
*
* @param {Search_Conversation_NextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_next = /** @type {((inputs?: Search_Conversation_NextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_NextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_conversation_next(inputs)
	return es_search_conversation_next(inputs)
});