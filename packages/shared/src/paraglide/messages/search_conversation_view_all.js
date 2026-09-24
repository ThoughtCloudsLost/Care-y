/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_Conversation_View_AllInputs */

const en_search_conversation_view_all = /** @type {(inputs: Search_Conversation_View_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`View all ${i?.count} matches in conversation`)
};

const es_search_conversation_view_all = /** @type {(inputs: Search_Conversation_View_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ver las ${i?.count} coincidencias en la conversación`)
};

const en_xa2_search_conversation_view_all = /** @type {(inputs: Search_Conversation_View_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Vìèw àll  •••${i?.count} màtchès ìn cònvèrsàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "View all {count} matches in conversation" |
*
* @param {Search_Conversation_View_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_view_all = /** @type {((inputs: Search_Conversation_View_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_View_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_conversation_view_all(inputs)
	if (locale === "en-XA") return en_xa2_search_conversation_view_all(inputs)
	return en_search_conversation_view_all(inputs)
});