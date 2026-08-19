/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_List_Search_HeadingInputs */

const en_demo_narrative_topic_list_search_heading = /** @type {(inputs: Demo_Narrative_Topic_List_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Searching this page`)
};

const es_demo_narrative_topic_list_search_heading = /** @type {(inputs: Demo_Narrative_Topic_List_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar en esta pagina`)
};

/**
* | output |
* | --- |
* | "Searching this page" |
*
* @param {Demo_Narrative_Topic_List_Search_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_search_heading = /** @type {((inputs?: Demo_Narrative_Topic_List_Search_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_List_Search_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_list_search_heading(inputs)
	return es_demo_narrative_topic_list_search_heading(inputs)
});