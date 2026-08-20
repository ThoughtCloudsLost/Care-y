/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Conversation_RevealInputs */

const en_demo_conversation_reveal = /** @type {(inputs: Demo_Conversation_RevealInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Decrypting messages`)
};

const es_demo_conversation_reveal = /** @type {(inputs: Demo_Conversation_RevealInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descifrando mensajes`)
};

/**
* | output |
* | --- |
* | "Decrypting messages" |
*
* @param {Demo_Conversation_RevealInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_reveal = /** @type {((inputs?: Demo_Conversation_RevealInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_RevealInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_conversation_reveal(inputs)
	return es_demo_conversation_reveal(inputs)
});