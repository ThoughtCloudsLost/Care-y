/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ current: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Conversation_PositionInputs */

const en_search_conversation_position = /** @type {(inputs: Search_Conversation_PositionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.current} of ${i?.total}`)
};

const es_search_conversation_position = /** @type {(inputs: Search_Conversation_PositionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.current} de ${i?.total}`)
};

const en_xa2_search_conversation_position = /** @type {(inputs: Search_Conversation_PositionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.current} òf  ••${i?.total}⟧`)
};

/**
* | output |
* | --- |
* | "{current} of {total}" |
*
* @param {Search_Conversation_PositionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_position = /** @type {((inputs: Search_Conversation_PositionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Conversation_PositionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_conversation_position(inputs)
	if (locale === "en-XA") return en_xa2_search_conversation_position(inputs)
	return en_search_conversation_position(inputs)
});