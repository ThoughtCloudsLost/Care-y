/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Light_ModeInputs */

const en_settings_light_mode = /** @type {(inputs: Settings_Light_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Light`)
};

const es_settings_light_mode = /** @type {(inputs: Settings_Light_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Claro`)
};

/**
* | output |
* | --- |
* | "Light" |
*
* @param {Settings_Light_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_light_mode = /** @type {((inputs?: Settings_Light_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Light_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_light_mode(inputs)
	return es_settings_light_mode(inputs)
});