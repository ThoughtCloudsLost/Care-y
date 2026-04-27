/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ provider: NonNullable<unknown> }} Admin_Telephony_Account_Id_HelperInputs */

const en_admin_telephony_account_id_helper = /** @type {(inputs: Admin_Telephony_Account_Id_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Find this in your ${i?.provider} account settings`)
};

const es_admin_telephony_account_id_helper = /** @type {(inputs: Admin_Telephony_Account_Id_HelperInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Encuentre esto en la configuracion de su cuenta de ${i?.provider}`)
};

/**
* | output |
* | --- |
* | "Find this in your {provider} account settings" |
*
* @param {Admin_Telephony_Account_Id_HelperInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_account_id_helper = /** @type {((inputs: Admin_Telephony_Account_Id_HelperInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Account_Id_HelperInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_account_id_helper(inputs)
	return es_admin_telephony_account_id_helper(inputs)
});