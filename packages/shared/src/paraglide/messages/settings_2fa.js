/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_2faInputs */

const en_settings_2fa = /** @type {(inputs: Settings_2faInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two factor authentication`)
};

const es_settings_2fa = /** @type {(inputs: Settings_2faInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autenticación de dos factores`)
};

const en_xa2_settings_2fa = /** @type {(inputs: Settings_2faInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Twò fàctòr àùthèntìcàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Two factor authentication" |
*
* @param {Settings_2faInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_2fa = /** @type {((inputs?: Settings_2faInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_2faInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_2fa(inputs)
	if (locale === "en-XA") return en_xa2_settings_2fa(inputs)
	return en_settings_2fa(inputs)
});