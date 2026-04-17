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

/**
* | output |
* | --- |
* | "Inactive" |
*
* @param {Admin_Status_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_status_inactive = /** @type {((inputs?: Admin_Status_InactiveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Status_InactiveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_status_inactive(inputs)
	return es_admin_status_inactive(inputs)
});