/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_Conversation_View_AllInputs */

const en_search_conversation_view_all = /** @type {(inputs: Search_Conversation_View_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`View all ${i?.count} matches in conversation`)
};

const es_search_conversation_view_all = /** @type {(inputs: Search_Conversation_View_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ver las ${i?.count} coincidencias en la conversacion`)
};

/**
* | output |
* | --- |
* | "View all {count} matches in conversation" |
*
* @param {Search_Conversation_View_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_view_all = /** @type {((inputs: Search_Conversation_View_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_View_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_conversation_view_all(inputs)
	return es_search_conversation_view_all(inputs)
});