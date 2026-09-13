/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_UsersInputs */

const en_permission_manage_users = /** @type {(inputs: Permission_Manage_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage users`)
};

const es_permission_manage_users = /** @type {(inputs: Permission_Manage_UsersInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar usuarios`)
};

/**
* | output |
* | --- |
* | "Manage users" |
*
* @param {Permission_Manage_UsersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_users = /** @type {((inputs?: Permission_Manage_UsersInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_UsersInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_manage_users(inputs)
	return es_permission_manage_users(inputs)
});