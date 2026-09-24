/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Username_SavedInputs */

const en_settings_username_saved = /** @type {(inputs: Settings_Username_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Username updated`)
};

const es_settings_username_saved = /** @type {(inputs: Settings_Username_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario actualizado`)
};

const en_xa2_settings_username_saved = /** @type {(inputs: Settings_Username_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèrnàmè ùpdàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Username updated" |
*
* @param {Settings_Username_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_username_saved = /** @type {((inputs?: Settings_Username_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Username_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_username_saved(inputs)
	if (locale === "en-XA") return en_xa2_settings_username_saved(inputs)
	return en_settings_username_saved(inputs)
});