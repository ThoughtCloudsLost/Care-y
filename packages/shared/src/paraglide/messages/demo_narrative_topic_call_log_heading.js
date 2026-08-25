/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Call_Log_HeadingInputs */

const en_demo_narrative_topic_call_log_heading = /** @type {(inputs: Demo_Narrative_Topic_Call_Log_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call log`)
};

const es_demo_narrative_topic_call_log_heading = /** @type {(inputs: Demo_Narrative_Topic_Call_Log_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registro de llamadas`)
};

/**
* | output |
* | --- |
* | "Call log" |
*
* @param {Demo_Narrative_Topic_Call_Log_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_call_log_heading = /** @type {((inputs?: Demo_Narrative_Topic_Call_Log_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Call_Log_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_call_log_heading(inputs)
	return es_demo_narrative_topic_call_log_heading(inputs)
});