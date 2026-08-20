/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Conversation_ErrorInputs */

const en_demo_conversation_error = /** @type {(inputs: Demo_Conversation_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Handling a decryption error`)
};

const es_demo_conversation_error = /** @type {(inputs: Demo_Conversation_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionando un error de descifrado`)
};

/**
* | output |
* | --- |
* | "Handling a decryption error" |
*
* @param {Demo_Conversation_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_error = /** @type {((inputs?: Demo_Conversation_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_conversation_error(inputs)
	return es_demo_conversation_error(inputs)
});