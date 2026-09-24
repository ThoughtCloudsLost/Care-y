/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reachability_Phone_UnverifiedInputs */

const en_admin_reachability_phone_unverified = /** @type {(inputs: Admin_Reachability_Phone_UnverifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone unverified`)
};

const es_admin_reachability_phone_unverified = /** @type {(inputs: Admin_Reachability_Phone_UnverifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Teléfono sin verificar`)
};

const en_xa2_admin_reachability_phone_unverified = /** @type {(inputs: Admin_Reachability_Phone_UnverifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè ùnvèrìfìèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone unverified" |
*
* @param {Admin_Reachability_Phone_UnverifiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reachability_phone_unverified = /** @type {((inputs?: Admin_Reachability_Phone_UnverifiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reachability_Phone_UnverifiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reachability_phone_unverified(inputs)
	if (locale === "en-XA") return en_xa2_admin_reachability_phone_unverified(inputs)
	return en_admin_reachability_phone_unverified(inputs)
});