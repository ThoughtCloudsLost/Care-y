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

/**
* | output |
* | --- |
* | "Retrying decryption" |
*
* @param {Demo_Conversation_RetryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_retry = /** @type {((inputs?: Demo_Conversation_RetryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_RetryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_conversation_retry(inputs)
	return es_demo_conversation_retry(inputs)
});