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

const en_xa2_settings_display_name_error = /** @type {(inputs: Settings_Display_Name_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùpdàtè dìsplày nàmè •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not update display name" |
*
* @param {Settings_Display_Name_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_error = /** @type {((inputs?: Settings_Display_Name_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Display_Name_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_display_name_error(inputs)
	if (locale === "en-XA") return en_xa2_settings_display_name_error(inputs)
	return en_settings_display_name_error(inputs)
});