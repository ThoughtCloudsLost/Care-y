/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Settings_TitleInputs */

const en_account_settings_title = /** @type {(inputs: Account_Settings_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account settings`)
};

const es_account_settings_title = /** @type {(inputs: Account_Settings_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuración de cuenta`)
};

const en_xa2_account_settings_title = /** @type {(inputs: Account_Settings_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àccòùnt sèttìngs •••••⟧`)
};

/**
* | output |
* | --- |
* | "Account settings" |
*
* @param {Account_Settings_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_settings_title = /** @type {((inputs?: Account_Settings_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Settings_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_settings_title(inputs)
	if (locale === "en-XA") return en_xa2_account_settings_title(inputs)
	return en_account_settings_title(inputs)
});