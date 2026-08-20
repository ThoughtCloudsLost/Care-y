/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Security_HeadingInputs */

const en_demo_narrative_settings_security_heading = /** @type {(inputs: Demo_Narrative_Settings_Security_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Security briefing`)
};

const es_demo_narrative_settings_security_heading = /** @type {(inputs: Demo_Narrative_Settings_Security_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Charla de seguridad`)
};

/**
* | output |
* | --- |
* | "Security briefing" |
*
* @param {Demo_Narrative_Settings_Security_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_security_heading = /** @type {((inputs?: Demo_Narrative_Settings_Security_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Security_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_settings_security_heading(inputs)
	return es_demo_narrative_settings_security_heading(inputs)
});