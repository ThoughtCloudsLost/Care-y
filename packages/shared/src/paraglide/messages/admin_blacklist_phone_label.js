/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blacklist_Phone_LabelInputs */

const en_admin_blacklist_phone_label = /** @type {(inputs: Admin_Blacklist_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Number`)
};

const es_admin_blacklist_phone_label = /** @type {(inputs: Admin_Blacklist_Phone_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numero`)
};

/**
* | output |
* | --- |
* | "Number" |
*
* @param {Admin_Blacklist_Phone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_phone_label = /** @type {((inputs?: Admin_Blacklist_Phone_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blacklist_Phone_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blacklist_phone_label(inputs)
	return es_admin_blacklist_phone_label(inputs)
});