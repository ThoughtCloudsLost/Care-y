/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_ConfirmInputs */

const en_settings_password_confirm = /** @type {(inputs: Settings_Password_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm new password`)
};

const es_settings_password_confirm = /** @type {(inputs: Settings_Password_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar nueva contrasena`)
};

/**
* | output |
* | --- |
* | "Confirm new password" |
*
* @param {Settings_Password_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_confirm = /** @type {((inputs?: Settings_Password_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_confirm(inputs)
	return es_settings_password_confirm(inputs)
});