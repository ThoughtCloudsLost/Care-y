/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Key_No_OrgInputs */

const en_admin_users_key_no_org = /** @type {(inputs: Admin_Users_Key_No_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No org key`)
};

const es_admin_users_key_no_org = /** @type {(inputs: Admin_Users_Key_No_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin clave de org`)
};

/**
* | output |
* | --- |
* | "No org key" |
*
* @param {Admin_Users_Key_No_OrgInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_key_no_org = /** @type {((inputs?: Admin_Users_Key_No_OrgInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Key_No_OrgInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_key_no_org(inputs)
	return es_admin_users_key_no_org(inputs)
});