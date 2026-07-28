/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Two_Factor_Methods_HeadingInputs */

const en_demo_narrative_settings_two_factor_methods_heading = /** @type {(inputs: Demo_Narrative_Settings_Two_Factor_Methods_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two-factor enrollment`)
};

const es_demo_narrative_settings_two_factor_methods_heading = /** @type {(inputs: Demo_Narrative_Settings_Two_Factor_Methods_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registro de segundo factor`)
};

/**
* | output |
* | --- |
* | "Two-factor enrollment" |
*
* @param {Demo_Narrative_Settings_Two_Factor_Methods_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_two_factor_methods_heading = /** @type {((inputs?: Demo_Narrative_Settings_Two_Factor_Methods_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Two_Factor_Methods_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_two_factor_methods_heading(inputs)
	return es_demo_narrative_settings_two_factor_methods_heading(inputs)
});