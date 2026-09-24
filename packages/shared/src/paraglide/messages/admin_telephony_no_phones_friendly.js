/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_No_Phones_FriendlyInputs */

const en_admin_telephony_no_phones_friendly = /** @type {(inputs: Admin_Telephony_No_Phones_FriendlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No numbers connected yet.`)
};

const es_admin_telephony_no_phones_friendly = /** @type {(inputs: Admin_Telephony_No_Phones_FriendlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay números conectados aún.`)
};

const en_xa2_admin_telephony_no_phones_friendly = /** @type {(inputs: Admin_Telephony_No_Phones_FriendlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò nùmbèrs cònnèctèd yèt. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No numbers connected yet." |
*
* @param {Admin_Telephony_No_Phones_FriendlyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_no_phones_friendly = /** @type {((inputs?: Admin_Telephony_No_Phones_FriendlyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_No_Phones_FriendlyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_no_phones_friendly(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_no_phones_friendly(inputs)
	return en_admin_telephony_no_phones_friendly(inputs)
});