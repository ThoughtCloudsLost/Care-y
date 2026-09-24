/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Purpose_SavedInputs */

const en_admin_telephony_purpose_saved = /** @type {(inputs: Admin_Telephony_Purpose_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roles updated`)
};

const es_admin_telephony_purpose_saved = /** @type {(inputs: Admin_Telephony_Purpose_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roles actualizados`)
};

const en_xa2_admin_telephony_purpose_saved = /** @type {(inputs: Admin_Telephony_Purpose_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròlès ùpdàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Roles updated" |
*
* @param {Admin_Telephony_Purpose_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_purpose_saved = /** @type {((inputs?: Admin_Telephony_Purpose_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Purpose_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_telephony_purpose_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_telephony_purpose_saved(inputs)
	return en_admin_telephony_purpose_saved(inputs)
});