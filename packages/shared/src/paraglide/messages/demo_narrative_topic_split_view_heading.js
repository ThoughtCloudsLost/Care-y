/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Split_View_HeadingInputs */

const en_demo_narrative_topic_split_view_heading = /** @type {(inputs: Demo_Narrative_Topic_Split_View_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desktop split view`)
};

const es_demo_narrative_topic_split_view_heading = /** @type {(inputs: Demo_Narrative_Topic_Split_View_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista dividida de escritorio`)
};

/**
* | output |
* | --- |
* | "Desktop split view" |
*
* @param {Demo_Narrative_Topic_Split_View_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_split_view_heading = /** @type {((inputs?: Demo_Narrative_Topic_Split_View_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Split_View_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_split_view_heading(inputs)
	return es_demo_narrative_topic_split_view_heading(inputs)
});