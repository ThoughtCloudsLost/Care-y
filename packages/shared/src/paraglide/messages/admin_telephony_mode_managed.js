/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Telephony_Mode_ManagedInputs */

const en_admin_telephony_mode_managed = /** @type {(inputs: Admin_Telephony_Mode_ManagedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Managed by platform`)
};

const es_admin_telephony_mode_managed = /** @type {(inputs: Admin_Telephony_Mode_ManagedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionado por la plataforma`)
};

/**
* | output |
* | --- |
* | "Managed by platform" |
*
* @param {Admin_Telephony_Mode_ManagedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mode_managed = /** @type {((inputs?: Admin_Telephony_Mode_ManagedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Telephony_Mode_ManagedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_telephony_mode_managed(inputs)
	return es_admin_telephony_mode_managed(inputs)
});