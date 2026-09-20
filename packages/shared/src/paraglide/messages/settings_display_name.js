/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Display_NameInputs */

const en_settings_display_name = /** @type {(inputs: Settings_Display_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Display Name`)
};

const es_settings_display_name = /** @type {(inputs: Settings_Display_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre visible`)
};

const en_xa2_settings_display_name = /** @type {(inputs: Settings_Display_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsplày Nàmè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Display Name" |
*
* @param {Settings_Display_NameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_display_name = /** @type {((inputs?: Settings_Display_NameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Display_NameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_display_name(inputs)
	if (locale === "en-XA") return en_xa2_settings_display_name(inputs)
	return en_settings_display_name(inputs)
});