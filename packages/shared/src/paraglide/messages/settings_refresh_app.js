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

const en_xa2_settings_refresh_app = /** @type {(inputs: Settings_Refresh_AppInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèfrèsh àpp ••••⟧`)
};

/**
* | output |
* | --- |
* | "Refresh app" |
*
* @param {Settings_Refresh_AppInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_refresh_app = /** @type {((inputs?: Settings_Refresh_AppInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Refresh_AppInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_refresh_app(inputs)
	if (locale === "en-XA") return en_xa2_settings_refresh_app(inputs)
	return en_settings_refresh_app(inputs)
});