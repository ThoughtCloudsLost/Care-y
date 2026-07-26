/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_View_Modes_HeadingInputs */

const en_demo_narrative_topic_view_modes_heading = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Multiple view layouts`)
};

const es_demo_narrative_topic_view_modes_heading = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Multiples modos de vista`)
};

/**
* | output |
* | --- |
* | "Multiple view layouts" |
*
* @param {Demo_Narrative_Topic_View_Modes_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_heading = /** @type {((inputs?: Demo_Narrative_Topic_View_Modes_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_View_Modes_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_view_modes_heading(inputs)
	return es_demo_narrative_topic_view_modes_heading(inputs)
});