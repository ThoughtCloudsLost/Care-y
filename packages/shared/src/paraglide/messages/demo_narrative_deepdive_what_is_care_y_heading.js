/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_What_Is_Care_Y_HeadingInputs */

const en_demo_narrative_deepdive_what_is_care_y_heading = /** @type {(inputs: Demo_Narrative_Deepdive_What_Is_Care_Y_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What CARE-Y is`)
};

const es_demo_narrative_deepdive_what_is_care_y_heading = /** @type {(inputs: Demo_Narrative_Deepdive_What_Is_Care_Y_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Qué es CARE-Y`)
};

const en_xa2_demo_narrative_deepdive_what_is_care_y_heading = /** @type {(inputs: Demo_Narrative_Deepdive_What_Is_Care_Y_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt CÀRÈ-Y ìs •••••⟧`)
};

/**
* | output |
* | --- |
* | "What CARE-Y is" |
*
* @param {Demo_Narrative_Deepdive_What_Is_Care_Y_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_what_is_care_y_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_What_Is_Care_Y_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_What_Is_Care_Y_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_what_is_care_y_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_deepdive_what_is_care_y_heading(inputs)
	return en_demo_narrative_deepdive_what_is_care_y_heading(inputs)
});