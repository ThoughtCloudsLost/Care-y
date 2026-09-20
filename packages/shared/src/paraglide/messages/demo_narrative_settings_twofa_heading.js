/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Twofa_HeadingInputs */

const en_demo_narrative_settings_twofa_heading = /** @type {(inputs: Demo_Narrative_Settings_Twofa_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two factor enrollment`)
};

const es_demo_narrative_settings_twofa_heading = /** @type {(inputs: Demo_Narrative_Settings_Twofa_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registro de segundo factor`)
};

const en_xa2_demo_narrative_settings_twofa_heading = /** @type {(inputs: Demo_Narrative_Settings_Twofa_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Twò fàctòr ènròllmènt •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Two factor enrollment" |
*
* @param {Demo_Narrative_Settings_Twofa_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_twofa_heading = /** @type {((inputs?: Demo_Narrative_Settings_Twofa_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Twofa_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_twofa_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_twofa_heading(inputs)
	return en_demo_narrative_settings_twofa_heading(inputs)
});