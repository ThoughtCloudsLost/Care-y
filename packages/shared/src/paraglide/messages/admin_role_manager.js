/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Manager: NonNullable<unknown> }} Admin_Role_ManagerInputs */

const en_admin_role_manager = /** @type {(inputs: Admin_Role_ManagerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Manager}`)
};

const es_admin_role_manager = /** @type {(inputs: Admin_Role_ManagerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Manager}`)
};

const en_xa2_admin_role_manager = /** @type {(inputs: Admin_Role_ManagerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Manager}⟧`)
};

/**
* | output |
* | --- |
* | "{Manager}" |
*
* @param {Admin_Role_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_role_manager = /** @type {((inputs: Admin_Role_ManagerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Role_ManagerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_role_manager(inputs)
	if (locale === "en-XA") return en_xa2_admin_role_manager(inputs)
	return en_admin_role_manager(inputs)
});