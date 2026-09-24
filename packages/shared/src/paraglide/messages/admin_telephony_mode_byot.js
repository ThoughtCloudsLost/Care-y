/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ provider: NonNullable<unknown> }} Admin_Telephony_Mode_ByotInputs */

const en_admin_telephony_mode_byot = /** @type {(inputs: Admin_Telephony_Mode_ByotInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.provider} (self-managed)`)
};

const es_admin_telephony_mode_byot = /** @type {(inputs: Admin_Telephony_Mode_ByotInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.provider} (autogestionado)`)
};

const en_xa2_admin_telephony_mode_byot = /** @type {(inputs: Admin_Telephony_Mode_ByotInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.provider} (sèlf-mànàgèd) •••••⟧`)
};

/**
* | output |
* | --- |
* | "{provider} (self-managed)" |
*
* @param {Admin_Telephony_Mode_ByotInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mode_byot = /** @type {((inputs: Admin_Telephony_Mode_ByotInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Mode_ByotInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_mode_byot(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_mode_byot(inputs)
	return en_admin_telephony_mode_byot(inputs)
});