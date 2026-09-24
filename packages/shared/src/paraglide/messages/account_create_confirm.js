/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Account_Create_ConfirmInputs */

const en_account_create_confirm = /** @type {(inputs: Account_Create_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm password`)
};

const es_account_create_confirm = /** @type {(inputs: Account_Create_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar contraseña`)
};

const en_xa2_account_create_confirm = /** @type {(inputs: Account_Create_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìrm pàsswòrd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Confirm password" |
*
* @param {Account_Create_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const account_create_confirm = /** @type {((inputs?: Account_Create_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Account_Create_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_account_create_confirm(inputs)
	if (locale === "en-XA") return en_xa2_account_create_confirm(inputs)
	return en_account_create_confirm(inputs)
});