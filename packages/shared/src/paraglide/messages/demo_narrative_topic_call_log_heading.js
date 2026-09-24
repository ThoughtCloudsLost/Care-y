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

const en_xa2_demo_narrative_topic_call_log_heading = /** @type {(inputs: Demo_Narrative_Topic_Call_Log_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll lòg •••⟧`)
};

/**
* | output |
* | --- |
* | "Call log" |
*
* @param {Demo_Narrative_Topic_Call_Log_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_call_log_heading = /** @type {((inputs?: Demo_Narrative_Topic_Call_Log_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Call_Log_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_call_log_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_call_log_heading(inputs)
	return en_demo_narrative_topic_call_log_heading(inputs)
});