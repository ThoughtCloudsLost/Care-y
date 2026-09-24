/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_2fa_Methods_OneInputs */

const en_settings_2fa_methods_one = /** @type {(inputs: Settings_2fa_Methods_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 method enrolled`)
};

const es_settings_2fa_methods_one = /** @type {(inputs: Settings_2fa_Methods_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 método inscrito`)
};

const en_xa2_settings_2fa_methods_one = /** @type {(inputs: Settings_2fa_Methods_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦1 mèthòd ènròllèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "1 method enrolled" |
*
* @param {Settings_2fa_Methods_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_2fa_methods_one = /** @type {((inputs?: Settings_2fa_Methods_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_2fa_Methods_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_2fa_methods_one(inputs)
	if (locale === "en-XA") return en_xa2_settings_2fa_methods_one(inputs)
	return en_settings_2fa_methods_one(inputs)
});