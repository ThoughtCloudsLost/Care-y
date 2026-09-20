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

const en_xa2_demo_narrative_topic_list_stats_heading = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìst còùnts ••••⟧`)
};

/**
* | output |
* | --- |
* | "List counts" |
*
* @param {Demo_Narrative_Topic_List_Stats_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_stats_heading = /** @type {((inputs?: Demo_Narrative_Topic_List_Stats_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_List_Stats_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_list_stats_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_list_stats_heading(inputs)
	return en_demo_narrative_topic_list_stats_heading(inputs)
});