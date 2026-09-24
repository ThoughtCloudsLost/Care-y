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

const en_xa2_demo_narrative_settings_identity_heading = /** @type {(inputs: Demo_Narrative_Settings_Identity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsplày nàmè ànd ùsèrnàmè ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Display name and username" |
*
* @param {Demo_Narrative_Settings_Identity_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_identity_heading = /** @type {((inputs?: Demo_Narrative_Settings_Identity_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Identity_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_identity_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_identity_heading(inputs)
	return en_demo_narrative_settings_identity_heading(inputs)
});