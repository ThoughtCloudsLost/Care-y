/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_SettingsInputs */

const en_panel_settings = /** @type {(inputs: Panel_SettingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Settings`)
};

const es_panel_settings = /** @type {(inputs: Panel_SettingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuracion`)
};

/**
* | output |
* | --- |
* | "Settings" |
*
* @param {Panel_SettingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_settings = /** @type {((inputs?: Panel_SettingsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_SettingsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_settings(inputs)
	return es_panel_settings(inputs)
});