/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_ConfirmInputs */

const en_settings_password_confirm = /** @type {(inputs: Settings_Password_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm new password`)
};

const es_settings_password_confirm = /** @type {(inputs: Settings_Password_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar nueva contraseña`)
};

const en_xa2_settings_password_confirm = /** @type {(inputs: Settings_Password_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìrm nèw pàsswòrd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Confirm new password" |
*
* @param {Settings_Password_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_confirm = /** @type {((inputs?: Settings_Password_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_confirm(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_confirm(inputs)
	return en_settings_password_confirm(inputs)
});