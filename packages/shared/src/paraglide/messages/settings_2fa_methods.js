/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Settings_2fa_MethodsInputs */

const en_settings_2fa_methods = /** @type {(inputs: Settings_2fa_MethodsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} methods enrolled`)
};

const es_settings_2fa_methods = /** @type {(inputs: Settings_2fa_MethodsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} métodos inscritos`)
};

const en_xa2_settings_2fa_methods = /** @type {(inputs: Settings_2fa_MethodsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} mèthòds ènròllèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} methods enrolled" |
*
* @param {Settings_2fa_MethodsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_2fa_methods = /** @type {((inputs: Settings_2fa_MethodsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_2fa_MethodsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_2fa_methods(inputs)
	if (locale === "en-XA") return en_xa2_settings_2fa_methods(inputs)
	return en_settings_2fa_methods(inputs)
});