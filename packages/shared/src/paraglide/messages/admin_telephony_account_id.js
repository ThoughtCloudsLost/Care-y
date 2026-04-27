/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Account_IdInputs */

const en_admin_telephony_account_id = /** @type {(inputs: Admin_Telephony_Account_IdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account ID`)
};

const es_admin_telephony_account_id = /** @type {(inputs: Admin_Telephony_Account_IdInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ID de cuenta`)
};

/**
* | output |
* | --- |
* | "Account ID" |
*
* @param {Admin_Telephony_Account_IdInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_account_id = /** @type {((inputs?: Admin_Telephony_Account_IdInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Account_IdInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_account_id(inputs)
	return es_admin_telephony_account_id(inputs)
});