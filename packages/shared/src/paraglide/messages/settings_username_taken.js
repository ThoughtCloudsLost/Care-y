/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Username_TakenInputs */

const en_settings_username_taken = /** @type {(inputs: Settings_Username_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This username is already taken`)
};

const es_settings_username_taken = /** @type {(inputs: Settings_Username_TakenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este usuario ya esta en uso`)
};

/**
* | output |
* | --- |
* | "This username is already taken" |
*
* @param {Settings_Username_TakenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_username_taken = /** @type {((inputs?: Settings_Username_TakenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Username_TakenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_username_taken(inputs)
	return es_settings_username_taken(inputs)
});