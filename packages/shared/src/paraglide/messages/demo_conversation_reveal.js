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

const en_xa2_demo_conversation_reveal = /** @type {(inputs: Demo_Conversation_RevealInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dècryptìng mèssàgès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Decrypting messages" |
*
* @param {Demo_Conversation_RevealInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_reveal = /** @type {((inputs?: Demo_Conversation_RevealInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_RevealInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_conversation_reveal(inputs)
	if (locale === "en-XA") return en_xa2_demo_conversation_reveal(inputs)
	return en_demo_conversation_reveal(inputs)
});