/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Api_Key_LabelInputs */

const en_admin_donations_api_key_label = /** @type {(inputs: Admin_Donations_Api_Key_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`API key`)
};

const es_admin_donations_api_key_label = /** @type {(inputs: Admin_Donations_Api_Key_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave de API`)
};

const en_xa2_admin_donations_api_key_label = /** @type {(inputs: Admin_Donations_Api_Key_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ÀPÌ kèy •••⟧`)
};

/**
* | output |
* | --- |
* | "API key" |
*
* @param {Admin_Donations_Api_Key_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_api_key_label = /** @type {((inputs?: Admin_Donations_Api_Key_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Api_Key_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_api_key_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_api_key_label(inputs)
	return en_admin_donations_api_key_label(inputs)
});