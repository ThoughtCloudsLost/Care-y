/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Users_Key_No_OrgInputs */

const en_admin_users_key_no_org = /** @type {(inputs: Admin_Users_Key_No_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Needs a key share`)
};

const es_admin_users_key_no_org = /** @type {(inputs: Admin_Users_Key_No_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Necesita una clave compartida`)
};

const en_xa2_admin_users_key_no_org = /** @type {(inputs: Admin_Users_Key_No_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèèds à kèy shàrè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Needs a key share" |
*
* @param {Admin_Users_Key_No_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_key_no_org = /** @type {((inputs?: Admin_Users_Key_No_OrgInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Key_No_OrgInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_key_no_org(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_key_no_org(inputs)
	return en_admin_users_key_no_org(inputs)
});