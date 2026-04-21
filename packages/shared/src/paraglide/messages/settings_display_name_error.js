/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Display_Name_ErrorInputs */

const en_settings_display_name_error = /** @type {(inputs: Settings_Display_Name_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not update display name`)
};

const es_settings_display_name_error = /** @type {(inputs: Settings_Display_Name_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo actualizar el nombre visible`)
};

/**
* | output |
* | --- |
* | "Could not update display name" |
*
* @param {Settings_Display_Name_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_error = /** @type {((inputs?: Settings_Display_Name_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Display_Name_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_display_name_error(inputs)
	return es_settings_display_name_error(inputs)
});