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

const en_xa2_settings_light_mode = /** @type {(inputs: Settings_Light_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìght ••⟧`)
};

/**
* | output |
* | --- |
* | "Light" |
*
* @param {Settings_Light_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_light_mode = /** @type {((inputs?: Settings_Light_ModeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Light_ModeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_light_mode(inputs)
	if (locale === "en-XA") return en_xa2_settings_light_mode(inputs)
	return en_settings_light_mode(inputs)
});