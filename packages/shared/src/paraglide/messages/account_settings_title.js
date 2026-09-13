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

/**
* | output |
* | --- |
* | "Account settings" |
*
* @param {Account_Settings_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_settings_title = /** @type {((inputs?: Account_Settings_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Settings_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_account_settings_title(inputs)
	return es_account_settings_title(inputs)
});