/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Recovery_TitleInputs */

const en_settings_password_recovery_title = /** @type {(inputs: Settings_Password_Recovery_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Complete key rotation`)
};

const es_settings_password_recovery_title = /** @type {(inputs: Settings_Password_Recovery_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Completar rotación de claves`)
};

const en_xa2_settings_password_recovery_title = /** @type {(inputs: Settings_Password_Recovery_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmplètè kèy ròtàtìòn •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Complete key rotation" |
*
* @param {Settings_Password_Recovery_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_recovery_title = /** @type {((inputs?: Settings_Password_Recovery_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Recovery_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_recovery_title(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_recovery_title(inputs)
	return en_settings_password_recovery_title(inputs)
});