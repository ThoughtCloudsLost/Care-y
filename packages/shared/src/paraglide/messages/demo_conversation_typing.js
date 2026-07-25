/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Conversation_TypingInputs */

const en_demo_conversation_typing = /** @type {(inputs: Demo_Conversation_TypingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sending a reply`)
};

const es_demo_conversation_typing = /** @type {(inputs: Demo_Conversation_TypingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviando una respuesta`)
};

/**
* | output |
* | --- |
* | "Sending a reply" |
*
* @param {Demo_Conversation_TypingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_typing = /** @type {((inputs?: Demo_Conversation_TypingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_TypingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_conversation_typing(inputs)
	return es_demo_conversation_typing(inputs)
});