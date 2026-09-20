/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ provider: NonNullable<unknown> }} Admin_Telephony_No_Phones_HintInputs */

const en_admin_telephony_no_phones_hint = /** @type {(inputs: Admin_Telephony_No_Phones_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tap Refresh Numbers above to sync from ${i?.provider}.`)
};

const es_admin_telephony_no_phones_hint = /** @type {(inputs: Admin_Telephony_No_Phones_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Toque Actualizar números arriba para sincronizar desde ${i?.provider}.`)
};

const en_xa2_admin_telephony_no_phones_hint = /** @type {(inputs: Admin_Telephony_No_Phones_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Tàp Rèfrèsh Nùmbèrs àbòvè tò sync fròm  ••••••••••••${i?.provider}. •⟧`)
};

/**
* | output |
* | --- |
* | "Tap Refresh Numbers above to sync from {provider}." |
*
* @param {Admin_Telephony_No_Phones_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_no_phones_hint = /** @type {((inputs: Admin_Telephony_No_Phones_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_No_Phones_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_no_phones_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_no_phones_hint(inputs)
	return en_admin_telephony_no_phones_hint(inputs)
});