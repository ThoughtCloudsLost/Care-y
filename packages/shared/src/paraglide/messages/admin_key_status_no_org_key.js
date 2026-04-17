/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Key_Status_No_Org_KeyInputs */

const en_admin_key_status_no_org_key = /** @type {(inputs: Admin_Key_Status_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Missing org key`)
};

const es_admin_key_status_no_org_key = /** @type {(inputs: Admin_Key_Status_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Falta clave de org`)
};

/**
* | output |
* | --- |
* | "Missing org key" |
*
* @param {Admin_Key_Status_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_key_status_no_org_key = /** @type {((inputs?: Admin_Key_Status_No_Org_KeyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Key_Status_No_Org_KeyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_key_status_no_org_key(inputs)
	return es_admin_key_status_no_org_key(inputs)
});