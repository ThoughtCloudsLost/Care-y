/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Role_AdminInputs */

const en_admin_role_admin = /** @type {(inputs: Admin_Role_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin`)
};

const es_admin_role_admin = /** @type {(inputs: Admin_Role_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin`)
};

const en_xa2_admin_role_admin = /** @type {(inputs: Admin_Role_AdminInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdmìn ••⟧`)
};

/**
* | output |
* | --- |
* | "Admin" |
*
* @param {Admin_Role_AdminInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_role_admin = /** @type {((inputs?: Admin_Role_AdminInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Role_AdminInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_role_admin(inputs)
	if (locale === "en-XA") return en_xa2_admin_role_admin(inputs)
	return en_admin_role_admin(inputs)
});