/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_No_Phones_FriendlyInputs */

const en_admin_telephony_no_phones_friendly = /** @type {(inputs: Admin_Telephony_No_Phones_FriendlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No numbers connected yet.`)
};

const es_admin_telephony_no_phones_friendly = /** @type {(inputs: Admin_Telephony_No_Phones_FriendlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay numeros conectados aun.`)
};

/**
* | output |
* | --- |
* | "No numbers connected yet." |
*
* @param {Admin_Telephony_No_Phones_FriendlyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_no_phones_friendly = /** @type {((inputs?: Admin_Telephony_No_Phones_FriendlyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_No_Phones_FriendlyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_no_phones_friendly(inputs)
	return es_admin_telephony_no_phones_friendly(inputs)
});