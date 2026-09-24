/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Purpose_NoneInputs */

const en_admin_telephony_purpose_none = /** @type {(inputs: Admin_Telephony_Purpose_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Not assigned`)
};

const es_admin_telephony_purpose_none = /** @type {(inputs: Admin_Telephony_Purpose_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin asignar`)
};

const en_xa2_admin_telephony_purpose_none = /** @type {(inputs: Admin_Telephony_Purpose_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòt àssìgnèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Not assigned" |
*
* @param {Admin_Telephony_Purpose_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_purpose_none = /** @type {((inputs?: Admin_Telephony_Purpose_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Purpose_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_purpose_none(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_purpose_none(inputs)
	return en_admin_telephony_purpose_none(inputs)
});