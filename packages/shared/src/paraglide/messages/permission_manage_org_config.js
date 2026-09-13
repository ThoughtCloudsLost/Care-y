/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Org_ConfigInputs */

const en_permission_manage_org_config = /** @type {(inputs: Permission_Manage_Org_ConfigInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage organization settings`)
};

const es_permission_manage_org_config = /** @type {(inputs: Permission_Manage_Org_ConfigInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar configuración de la organización`)
};

/**
* | output |
* | --- |
* | "Manage organization settings" |
*
* @param {Permission_Manage_Org_ConfigInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_org_config = /** @type {((inputs?: Permission_Manage_Org_ConfigInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Org_ConfigInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_manage_org_config(inputs)
	return es_permission_manage_org_config(inputs)
});