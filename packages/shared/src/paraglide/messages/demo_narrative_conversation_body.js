/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Conversation_BodyInputs */

const en_demo_narrative_conversation_body = /** @type {(inputs: Demo_Narrative_Conversation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each message in a ticket is individually encrypted. Volunteers decrypt them in their browser, reply, and the response is encrypted before leaving the device.`)
};

const es_demo_narrative_conversation_body = /** @type {(inputs: Demo_Narrative_Conversation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada mensaje en un ticket se cifra individualmente. Los voluntarios lo descifran en su navegador, responden, y la respuesta se cifra antes de salir del dispositivo.`)
};

/**
* | output |
* | --- |
* | "Each message in a ticket is individually encrypted. Volunteers decrypt them in their browser, reply, and the response is encrypted before leaving the device." |
*
* @param {Demo_Narrative_Conversation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_conversation_body = /** @type {((inputs?: Demo_Narrative_Conversation_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Conversation_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_conversation_body(inputs)
	return es_demo_narrative_conversation_body(inputs)
});