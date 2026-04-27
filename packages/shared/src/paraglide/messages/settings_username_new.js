/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Username_NewInputs */

const en_settings_username_new = /** @type {(inputs: Settings_Username_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New username`)
};

const es_settings_username_new = /** @type {(inputs: Settings_Username_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo usuario`)
};

/**
* | output |
* | --- |
* | "New username" |
*
* @param {Settings_Username_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_username_new = /** @type {((inputs?: Settings_Username_NewInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Username_NewInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_username_new(inputs)
	return es_settings_username_new(inputs)
});