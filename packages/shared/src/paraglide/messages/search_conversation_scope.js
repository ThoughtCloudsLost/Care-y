/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Conversation_ScopeInputs */

const en_search_conversation_scope = /** @type {(inputs: Search_Conversation_ScopeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched ${i?.searched} of ${i?.total} messages`)
};

const es_search_conversation_scope = /** @type {(inputs: Search_Conversation_ScopeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscados ${i?.searched} de ${i?.total} mensajes`)
};

const en_xa2_search_conversation_scope = /** @type {(inputs: Search_Conversation_ScopeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrchèd  •••${i?.searched} òf  ••${i?.total} mèssàgès •••⟧`)
};

/**
* | output |
* | --- |
* | "Searched {searched} of {total} messages" |
*
* @param {Search_Conversation_ScopeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_scope = /** @type {((inputs: Search_Conversation_ScopeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_ScopeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_conversation_scope(inputs)
	if (locale === "en-XA") return en_xa2_search_conversation_scope(inputs)
	return en_search_conversation_scope(inputs)
});