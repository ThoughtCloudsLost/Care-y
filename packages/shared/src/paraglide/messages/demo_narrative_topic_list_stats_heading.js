/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_List_Stats_HeadingInputs */

const en_demo_narrative_topic_list_stats_heading = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`List counts`)
};

const es_demo_narrative_topic_list_stats_heading = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Conteos de la lista`)
};

/**
* | output |
* | --- |
* | "List counts" |
*
* @param {Demo_Narrative_Topic_List_Stats_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_stats_heading = /** @type {((inputs?: Demo_Narrative_Topic_List_Stats_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_List_Stats_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_list_stats_heading(inputs)
	return es_demo_narrative_topic_list_stats_heading(inputs)
});