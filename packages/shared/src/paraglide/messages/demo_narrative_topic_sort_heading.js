/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Sort_HeadingInputs */

const en_demo_narrative_topic_sort_heading = /** @type {(inputs: Demo_Narrative_Topic_Sort_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sorting`)
};

const es_demo_narrative_topic_sort_heading = /** @type {(inputs: Demo_Narrative_Topic_Sort_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ordenamiento`)
};

/**
* | output |
* | --- |
* | "Sorting" |
*
* @param {Demo_Narrative_Topic_Sort_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_sort_heading = /** @type {((inputs?: Demo_Narrative_Topic_Sort_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Sort_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_sort_heading(inputs)
	return es_demo_narrative_topic_sort_heading(inputs)
});