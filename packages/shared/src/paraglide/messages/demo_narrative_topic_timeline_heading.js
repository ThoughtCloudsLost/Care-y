/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Timeline_HeadingInputs */

const en_demo_narrative_topic_timeline_heading = /** @type {(inputs: Demo_Narrative_Topic_Timeline_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Timeline view`)
};

const es_demo_narrative_topic_timeline_heading = /** @type {(inputs: Demo_Narrative_Topic_Timeline_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista de linea de tiempo`)
};

/**
* | output |
* | --- |
* | "Timeline view" |
*
* @param {Demo_Narrative_Topic_Timeline_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_timeline_heading = /** @type {((inputs?: Demo_Narrative_Topic_Timeline_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Timeline_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_timeline_heading(inputs)
	return es_demo_narrative_topic_timeline_heading(inputs)
});