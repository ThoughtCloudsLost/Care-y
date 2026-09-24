/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Change_SuccessInputs */

const en_account_change_success = /** @type {(inputs: Account_Change_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password changed. Other sessions have been signed out.`)
};

const es_account_change_success = /** @type {(inputs: Account_Change_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraseña cambiada. Las demás sesiones se cerraron.`)
};

const en_xa2_account_change_success = /** @type {(inputs: Account_Change_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàsswòrd chàngèd. Òthèr sèssìòns hàvè bèèn sìgnèd òùt. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Password changed. Other sessions have been signed out." |
*
* @param {Account_Change_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_change_success = /** @type {((inputs?: Account_Change_SuccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Change_SuccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_change_success(inputs)
	if (locale === "en-XA") return en_xa2_account_change_success(inputs)
	return en_account_change_success(inputs)
});