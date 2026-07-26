/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Filters_HeadingInputs */

const en_demo_narrative_topic_thread_filters_heading = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtering a conversation`)
};

const es_demo_narrative_topic_thread_filters_heading = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtrando una conversacion`)
};

/**
* | output |
* | --- |
* | "Filtering a conversation" |
*
* @param {Demo_Narrative_Topic_Thread_Filters_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_filters_heading = /** @type {((inputs?: Demo_Narrative_Topic_Thread_Filters_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Thread_Filters_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_thread_filters_heading(inputs)
	return es_demo_narrative_topic_thread_filters_heading(inputs)
});