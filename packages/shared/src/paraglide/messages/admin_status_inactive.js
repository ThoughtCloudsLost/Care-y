/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Status_InactiveInputs */

const en_admin_status_inactive = /** @type {(inputs: Admin_Status_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inactive`)
};

const es_admin_status_inactive = /** @type {(inputs: Admin_Status_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inactivo`)
};

const en_xa2_admin_status_inactive = /** @type {(inputs: Admin_Status_InactiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìnàctìvè •••⟧`)
};

/**
* | output |
* | --- |
* | "Inactive" |
*
* @param {Admin_Status_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_status_inactive = /** @type {((inputs?: Admin_Status_InactiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Status_InactiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_status_inactive(inputs)
	if (locale === "en-XA") return en_xa2_admin_status_inactive(inputs)
	return en_admin_status_inactive(inputs)
});