/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Conversation_Load_AllInputs */

const en_search_conversation_load_all = /** @type {(inputs: Search_Conversation_Load_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load all messages to search`)
};

const es_search_conversation_load_all = /** @type {(inputs: Search_Conversation_Load_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargar todos los mensajes para buscar`)
};

/**
* | output |
* | --- |
* | "Load all messages to search" |
*
* @param {Search_Conversation_Load_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_load_all = /** @type {((inputs?: Search_Conversation_Load_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_Load_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_conversation_load_all(inputs)
	return es_search_conversation_load_all(inputs)
});