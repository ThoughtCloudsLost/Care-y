/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_2faInputs */

const en_settings_2fa = /** @type {(inputs: Settings_2faInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two-factor authentication`)
};

const es_settings_2fa = /** @type {(inputs: Settings_2faInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autenticación de dos factores`)
};

/**
* | output |
* | --- |
* | "Two-factor authentication" |
*
* @param {Settings_2faInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_2fa = /** @type {((inputs?: Settings_2faInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_2faInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_2fa(inputs)
	return es_settings_2fa(inputs)
});