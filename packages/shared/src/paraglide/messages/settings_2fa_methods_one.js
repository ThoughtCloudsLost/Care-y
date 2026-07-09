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

/**
* | output |
* | --- |
* | "1 method enrolled" |
*
* @param {Settings_2fa_Methods_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_2fa_methods_one = /** @type {((inputs?: Settings_2fa_Methods_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_2fa_Methods_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_2fa_methods_one(inputs)
	return es_settings_2fa_methods_one(inputs)
});