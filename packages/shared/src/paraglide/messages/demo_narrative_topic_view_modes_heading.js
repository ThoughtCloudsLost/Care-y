/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_View_Modes_HeadingInputs */

const en_demo_narrative_topic_view_modes_heading = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View modes`)
};

const es_demo_narrative_topic_view_modes_heading = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Modos de vista`)
};

const en_xa2_demo_narrative_topic_view_modes_heading = /** @type {(inputs: Demo_Narrative_Topic_View_Modes_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw mòdès •••⟧`)
};

/**
* | output |
* | --- |
* | "View modes" |
*
* @param {Demo_Narrative_Topic_View_Modes_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_heading = /** @type {((inputs?: Demo_Narrative_Topic_View_Modes_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_View_Modes_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_view_modes_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_view_modes_heading(inputs)
	return en_demo_narrative_topic_view_modes_heading(inputs)
});