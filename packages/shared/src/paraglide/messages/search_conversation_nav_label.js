/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Conversation_Nav_LabelInputs */

const en_search_conversation_nav_label = /** @type {(inputs: Search_Conversation_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search navigation`)
};

const es_search_conversation_nav_label = /** @type {(inputs: Search_Conversation_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navegacion de busqueda`)
};

/**
* | output |
* | --- |
* | "Search navigation" |
*
* @param {Search_Conversation_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_nav_label = /** @type {((inputs?: Search_Conversation_Nav_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_Nav_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_conversation_nav_label(inputs)
	return es_search_conversation_nav_label(inputs)
});