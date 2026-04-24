/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Recovery_LabelInputs */

const en_settings_password_recovery_label = /** @type {(inputs: Settings_Password_Recovery_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current password`)
};

const es_settings_password_recovery_label = /** @type {(inputs: Settings_Password_Recovery_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contrasena actual`)
};

/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Settings_Password_Recovery_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_recovery_label = /** @type {((inputs?: Settings_Password_Recovery_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Recovery_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_recovery_label(inputs)
	return es_settings_password_recovery_label(inputs)
});