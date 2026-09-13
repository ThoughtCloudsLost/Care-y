/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Perm_Reset_SuccessInputs */

const en_roles_perm_reset_success = /** @type {(inputs: Roles_Perm_Reset_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role permissions reset to defaults`)
};

const es_roles_perm_reset_success = /** @type {(inputs: Roles_Perm_Reset_SuccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permisos de roles restablecidos`)
};

/**
* | output |
* | --- |
* | "Role permissions reset to defaults" |
*
* @param {Roles_Perm_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_perm_reset_success = /** @type {((inputs?: Roles_Perm_Reset_SuccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Perm_Reset_SuccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_perm_reset_success(inputs)
	return es_roles_perm_reset_success(inputs)
});