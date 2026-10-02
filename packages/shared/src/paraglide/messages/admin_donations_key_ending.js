/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ hint: NonNullable<unknown> }} Admin_Donations_Key_EndingInputs */

const en_admin_donations_key_ending = /** @type {(inputs: Admin_Donations_Key_EndingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Key ending ${i?.hint}`)
};

const es_admin_donations_key_ending = /** @type {(inputs: Admin_Donations_Key_EndingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Clave terminada en ${i?.hint}`)
};

const en_xa2_admin_donations_key_ending = /** @type {(inputs: Admin_Donations_Key_EndingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Kèy èndìng  ••••${i?.hint}⟧`)
};

/**
* | output |
* | --- |
* | "Key ending {hint}" |
*
* @param {Admin_Donations_Key_EndingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_key_ending = /** @type {((inputs: Admin_Donations_Key_EndingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Key_EndingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_key_ending(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_key_ending(inputs)
	return en_admin_donations_key_ending(inputs)
});