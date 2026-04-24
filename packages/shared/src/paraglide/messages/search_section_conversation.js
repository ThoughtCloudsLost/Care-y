/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Section_ConversationInputs */

const en_search_section_conversation = /** @type {(inputs: Search_Section_ConversationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`In this conversation`)
};

const es_search_section_conversation = /** @type {(inputs: Search_Section_ConversationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En esta conversacion`)
};

/**
* | output |
* | --- |
* | "In this conversation" |
*
* @param {Search_Section_ConversationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_conversation = /** @type {((inputs?: Search_Section_ConversationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Section_ConversationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_section_conversation(inputs)
	return es_search_section_conversation(inputs)
});