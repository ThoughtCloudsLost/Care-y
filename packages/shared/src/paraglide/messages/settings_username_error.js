/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Username_ErrorInputs */

const en_settings_username_error = /** @type {(inputs: Settings_Username_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not update username`)
};

const es_settings_username_error = /** @type {(inputs: Settings_Username_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo actualizar el usuario`)
};

const en_xa2_settings_username_error = /** @type {(inputs: Settings_Username_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùpdàtè ùsèrnàmè ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not update username" |
*
* @param {Settings_Username_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_username_error = /** @type {((inputs?: Settings_Username_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Username_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_username_error(inputs)
	if (locale === "en-XA") return en_xa2_settings_username_error(inputs)
	return en_settings_username_error(inputs)
});