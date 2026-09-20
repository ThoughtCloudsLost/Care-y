/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Filters_HeadingInputs */

const en_demo_narrative_topic_thread_filters_heading = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtering a conversation`)
};

const es_demo_narrative_topic_thread_filters_heading = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtrando una conversación`)
};

const en_xa2_demo_narrative_topic_thread_filters_heading = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèrìng à cònvèrsàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Filtering a conversation" |
*
* @param {Demo_Narrative_Topic_Thread_Filters_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_filters_heading = /** @type {((inputs?: Demo_Narrative_Topic_Thread_Filters_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Thread_Filters_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_thread_filters_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_thread_filters_heading(inputs)
	return en_demo_narrative_topic_thread_filters_heading(inputs)
});