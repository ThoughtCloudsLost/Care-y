/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Display_Name_NewInputs */

const en_settings_display_name_new = /** @type {(inputs: Settings_Display_Name_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New display name`)
};

const es_settings_display_name_new = /** @type {(inputs: Settings_Display_Name_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo nombre visible`)
};

/**
* | output |
* | --- |
* | "New display name" |
*
* @param {Settings_Display_Name_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_new = /** @type {((inputs?: Settings_Display_Name_NewInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Display_Name_NewInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_display_name_new(inputs)
	return es_settings_display_name_new(inputs)
});