/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Username_Password_HintInputs */

const en_settings_username_password_hint = /** @type {(inputs: Settings_Username_Password_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Required to confirm identity`)
};

const es_settings_username_password_hint = /** @type {(inputs: Settings_Username_Password_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Requerida para confirmar identidad`)
};

const en_xa2_settings_username_password_hint = /** @type {(inputs: Settings_Username_Password_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèqùìrèd tò cònfìrm ìdèntìty •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Required to confirm identity" |
*
* @param {Settings_Username_Password_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_username_password_hint = /** @type {((inputs?: Settings_Username_Password_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Username_Password_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_username_password_hint(inputs)
	if (locale === "en-XA") return en_xa2_settings_username_password_hint(inputs)
	return en_settings_username_password_hint(inputs)
});