/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_RolesInputs */

const en_permission_manage_roles = /** @type {(inputs: Permission_Manage_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage roles`)
};

const es_permission_manage_roles = /** @type {(inputs: Permission_Manage_RolesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar roles`)
};

/**
* | output |
* | --- |
* | "Manage roles" |
*
* @param {Permission_Manage_RolesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_roles = /** @type {((inputs?: Permission_Manage_RolesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_RolesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_manage_roles(inputs)
	return es_permission_manage_roles(inputs)
});