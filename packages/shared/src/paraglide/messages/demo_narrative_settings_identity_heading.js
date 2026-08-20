/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Identity_HeadingInputs */

const en_demo_narrative_settings_identity_heading = /** @type {(inputs: Demo_Narrative_Settings_Identity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Display name and username`)
};

const es_demo_narrative_settings_identity_heading = /** @type {(inputs: Demo_Narrative_Settings_Identity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre visible y usuario`)
};

/**
* | output |
* | --- |
* | "Display name and username" |
*
* @param {Demo_Narrative_Settings_Identity_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_identity_heading = /** @type {((inputs?: Demo_Narrative_Settings_Identity_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Identity_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_identity_heading(inputs)
	return es_demo_narrative_settings_identity_heading(inputs)
});