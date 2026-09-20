/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Org_IdentityInputs */

const en_permission_manage_org_identity = /** @type {(inputs: Permission_Manage_Org_IdentityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage org identity`)
};

const es_permission_manage_org_identity = /** @type {(inputs: Permission_Manage_Org_IdentityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar identidad de la organización`)
};

/**
* | output |
* | --- |
* | "Manage org identity" |
*
* @param {Permission_Manage_Org_IdentityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_org_identity = /** @type {((inputs?: Permission_Manage_Org_IdentityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Org_IdentityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_org_identity(inputs)
	return en_permission_manage_org_identity(inputs)
});