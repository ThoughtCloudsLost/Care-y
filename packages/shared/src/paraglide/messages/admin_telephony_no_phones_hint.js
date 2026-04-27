/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ provider: NonNullable<unknown> }} Admin_Telephony_No_Phones_HintInputs */

const en_admin_telephony_no_phones_hint = /** @type {(inputs: Admin_Telephony_No_Phones_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tap Refresh Numbers above to sync from ${i?.provider}.`)
};

const es_admin_telephony_no_phones_hint = /** @type {(inputs: Admin_Telephony_No_Phones_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Toque Actualizar numeros arriba para sincronizar desde ${i?.provider}.`)
};

/**
* | output |
* | --- |
* | "Tap Refresh Numbers above to sync from {provider}." |
*
* @param {Admin_Telephony_No_Phones_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_no_phones_hint = /** @type {((inputs: Admin_Telephony_No_Phones_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_No_Phones_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_no_phones_hint(inputs)
	return es_admin_telephony_no_phones_hint(inputs)
});