/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Consultant_Phone_HeadingInputs */

const en_demo_narrative_settings_consultant_phone_heading = /** @type {(inputs: Demo_Narrative_Settings_Consultant_Phone_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Consultant phone`)
};

const es_demo_narrative_settings_consultant_phone_heading = /** @type {(inputs: Demo_Narrative_Settings_Consultant_Phone_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Teléfono de consultor`)
};

/**
* | output |
* | --- |
* | "Consultant phone" |
*
* @param {Demo_Narrative_Settings_Consultant_Phone_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_consultant_phone_heading = /** @type {((inputs?: Demo_Narrative_Settings_Consultant_Phone_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Consultant_Phone_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_consultant_phone_heading(inputs)
	return en_demo_narrative_settings_consultant_phone_heading(inputs)
});