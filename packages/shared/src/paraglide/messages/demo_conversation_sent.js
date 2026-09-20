/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Conversation_SentInputs */

const en_demo_conversation_sent = /** @type {(inputs: Demo_Conversation_SentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply sent`)
};

const es_demo_conversation_sent = /** @type {(inputs: Demo_Conversation_SentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta enviada`)
};

const en_xa2_demo_conversation_sent = /** @type {(inputs: Demo_Conversation_SentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèply sènt •••⟧`)
};

/**
* | output |
* | --- |
* | "Reply sent" |
*
* @param {Demo_Conversation_SentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_sent = /** @type {((inputs?: Demo_Conversation_SentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Conversation_SentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_conversation_sent(inputs)
	if (locale === "en-XA") return en_xa2_demo_conversation_sent(inputs)
	return en_demo_conversation_sent(inputs)
});