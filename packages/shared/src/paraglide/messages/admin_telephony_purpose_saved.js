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

/**
* | output |
* | --- |
* | "Roles updated" |
*
* @param {Admin_Telephony_Purpose_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_purpose_saved = /** @type {((inputs?: Admin_Telephony_Purpose_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Purpose_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_purpose_saved(inputs)
	return es_admin_telephony_purpose_saved(inputs)
});