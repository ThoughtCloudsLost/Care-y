/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Refresh_AppInputs */

const en_settings_refresh_app = /** @type {(inputs: Settings_Refresh_AppInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refresh app`)
};

const es_settings_refresh_app = /** @type {(inputs: Settings_Refresh_AppInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actualizar app`)
};

/**
* | output |
* | --- |
* | "Refresh app" |
*
* @param {Settings_Refresh_AppInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_refresh_app = /** @type {((inputs?: Settings_Refresh_AppInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Refresh_AppInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_refresh_app(inputs)
	return es_settings_refresh_app(inputs)
});