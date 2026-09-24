/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Conversation_RetryInputs */

const en_demo_conversation_retry = /** @type {(inputs: Demo_Conversation_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retrying decryption`)
};

const es_demo_conversation_retry = /** @type {(inputs: Demo_Conversation_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reintentando descifrado`)
};

const en_xa2_demo_conversation_retry = /** @type {(inputs: Demo_Conversation_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètryìng dècryptìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Retrying decryption" |
*
* @param {Demo_Conversation_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_retry = /** @type {((inputs?: Demo_Conversation_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_conversation_retry(inputs)
	if (locale === "en-XA") return en_xa2_demo_conversation_retry(inputs)
	return en_demo_conversation_retry(inputs)
});