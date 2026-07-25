/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Conversation_HeaderInputs */

const en_demo_conversation_header = /** @type {(inputs: Demo_Conversation_HeaderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Viewing the conversation`)
};

const es_demo_conversation_header = /** @type {(inputs: Demo_Conversation_HeaderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Viendo la conversacion`)
};

/**
* | output |
* | --- |
* | "Viewing the conversation" |
*
* @param {Demo_Conversation_HeaderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_header = /** @type {((inputs?: Demo_Conversation_HeaderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_HeaderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_conversation_header(inputs)
	return es_demo_conversation_header(inputs)
});