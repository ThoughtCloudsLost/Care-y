/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Conversation_Nav_LabelInputs */

const en_search_conversation_nav_label = /** @type {(inputs: Search_Conversation_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search navigation`)
};

const es_search_conversation_nav_label = /** @type {(inputs: Search_Conversation_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navegación de búsqueda`)
};

const en_xa2_search_conversation_nav_label = /** @type {(inputs: Search_Conversation_Nav_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch nàvìgàtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Search navigation" |
*
* @param {Search_Conversation_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_nav_label = /** @type {((inputs?: Search_Conversation_Nav_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_Nav_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_conversation_nav_label(inputs)
	if (locale === "en-XA") return en_xa2_search_conversation_nav_label(inputs)
	return en_search_conversation_nav_label(inputs)
});