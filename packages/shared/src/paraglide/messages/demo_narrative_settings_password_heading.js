/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Password_HeadingInputs */

const en_demo_narrative_settings_password_heading = /** @type {(inputs: Demo_Narrative_Settings_Password_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password and key re-wrap`)
};

const es_demo_narrative_settings_password_heading = /** @type {(inputs: Demo_Narrative_Settings_Password_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña y re-envolvimiento de claves`)
};

/**
* | output |
* | --- |
* | "Password and key re-wrap" |
*
* @param {Demo_Narrative_Settings_Password_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_password_heading = /** @type {((inputs?: Demo_Narrative_Settings_Password_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Password_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_password_heading(inputs)
	return es_demo_narrative_settings_password_heading(inputs)
});