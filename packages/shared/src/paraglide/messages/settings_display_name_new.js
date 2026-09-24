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

const en_xa2_settings_display_name_new = /** @type {(inputs: Settings_Display_Name_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw dìsplày nàmè •••••⟧`)
};

/**
* | output |
* | --- |
* | "New display name" |
*
* @param {Settings_Display_Name_NewInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_display_name_new = /** @type {((inputs?: Settings_Display_Name_NewInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Display_Name_NewInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_display_name_new(inputs)
	if (locale === "en-XA") return en_xa2_settings_display_name_new(inputs)
	return en_settings_display_name_new(inputs)
});