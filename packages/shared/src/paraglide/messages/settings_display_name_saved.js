/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Display_Name_SavedInputs */

const en_settings_display_name_saved = /** @type {(inputs: Settings_Display_Name_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Display name updated`)
};

const es_settings_display_name_saved = /** @type {(inputs: Settings_Display_Name_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre visible actualizado`)
};

/**
* | output |
* | --- |
* | "Display name updated" |
*
* @param {Settings_Display_Name_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_saved = /** @type {((inputs?: Settings_Display_Name_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Display_Name_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_display_name_saved(inputs)
	return es_settings_display_name_saved(inputs)
});