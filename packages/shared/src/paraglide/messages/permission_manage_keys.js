/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_KeysInputs */

const en_permission_manage_keys = /** @type {(inputs: Permission_Manage_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage encryption keys`)
};

const es_permission_manage_keys = /** @type {(inputs: Permission_Manage_KeysInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar claves de cifrado`)
};

/**
* | output |
* | --- |
* | "Manage encryption keys" |
*
* @param {Permission_Manage_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_keys = /** @type {((inputs?: Permission_Manage_KeysInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_KeysInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_manage_keys(inputs)
	return es_permission_manage_keys(inputs)
});