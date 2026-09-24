/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Section_ConversationInputs */

const en_search_section_conversation = /** @type {(inputs: Search_Section_ConversationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`In this conversation`)
};

const es_search_section_conversation = /** @type {(inputs: Search_Section_ConversationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En esta conversación`)
};

const en_xa2_search_section_conversation = /** @type {(inputs: Search_Section_ConversationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìn thìs cònvèrsàtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "In this conversation" |
*
* @param {Search_Section_ConversationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_section_conversation = /** @type {((inputs?: Search_Section_ConversationInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_ConversationInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_section_conversation(inputs)
	if (locale === "en-XA") return en_xa2_search_section_conversation(inputs)
	return en_search_section_conversation(inputs)
});