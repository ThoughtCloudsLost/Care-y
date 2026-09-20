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

const en_xa2_search_conversation_load_all = /** @type {(inputs: Search_Conversation_Load_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàd àll mèssàgès tò sèàrch •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Load all messages to search" |
*
* @param {Search_Conversation_Load_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_load_all = /** @type {((inputs?: Search_Conversation_Load_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_Load_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_conversation_load_all(inputs)
	if (locale === "en-XA") return en_xa2_search_conversation_load_all(inputs)
	return en_search_conversation_load_all(inputs)
});