/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Conversation_HeadingInputs */

const en_demo_narrative_topic_conversation_heading = /** @type {(inputs: Demo_Narrative_Topic_Conversation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conversation thread`)
};

const es_demo_narrative_topic_conversation_heading = /** @type {(inputs: Demo_Narrative_Topic_Conversation_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hilo de conversación`)
};

/**
* | output |
* | --- |
* | "Conversation thread" |
*
* @param {Demo_Narrative_Topic_Conversation_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_conversation_heading = /** @type {((inputs?: Demo_Narrative_Topic_Conversation_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Conversation_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_conversation_heading(inputs)
	return es_demo_narrative_topic_conversation_heading(inputs)
});