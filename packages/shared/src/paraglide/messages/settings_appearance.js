/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_AppearanceInputs */

const en_settings_appearance = /** @type {(inputs: Settings_AppearanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Appearance`)
};

const es_settings_appearance = /** @type {(inputs: Settings_AppearanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Apariencia`)
};

const en_xa2_settings_appearance = /** @type {(inputs: Settings_AppearanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àppèàràncè •••⟧`)
};

/**
* | output |
* | --- |
* | "Appearance" |
*
* @param {Settings_AppearanceInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_appearance = /** @type {((inputs?: Settings_AppearanceInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_AppearanceInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_appearance(inputs)
	if (locale === "en-XA") return en_xa2_settings_appearance(inputs)
	return en_settings_appearance(inputs)
});