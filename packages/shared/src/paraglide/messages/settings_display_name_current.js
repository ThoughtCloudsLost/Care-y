/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Display_Name_CurrentInputs */

const en_settings_display_name_current = /** @type {(inputs: Settings_Display_Name_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current name`)
};

const es_settings_display_name_current = /** @type {(inputs: Settings_Display_Name_CurrentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre actual`)
};

/**
* | output |
* | --- |
* | "Current name" |
*
* @param {Settings_Display_Name_CurrentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_current = /** @type {((inputs?: Settings_Display_Name_CurrentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Display_Name_CurrentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_display_name_current(inputs)
	return es_settings_display_name_current(inputs)
});