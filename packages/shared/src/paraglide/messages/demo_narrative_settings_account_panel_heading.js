/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Account_Panel_HeadingInputs */

const en_demo_narrative_settings_account_panel_heading = /** @type {(inputs: Demo_Narrative_Settings_Account_Panel_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account panel`)
};

const es_demo_narrative_settings_account_panel_heading = /** @type {(inputs: Demo_Narrative_Settings_Account_Panel_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Panel de cuenta`)
};

const en_xa2_demo_narrative_settings_account_panel_heading = /** @type {(inputs: Demo_Narrative_Settings_Account_Panel_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt pànèl ••••⟧`)
};

/**
* | output |
* | --- |
* | "Account panel" |
*
* @param {Demo_Narrative_Settings_Account_Panel_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_account_panel_heading = /** @type {((inputs?: Demo_Narrative_Settings_Account_Panel_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Account_Panel_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_account_panel_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_account_panel_heading(inputs)
	return en_demo_narrative_settings_account_panel_heading(inputs)
});