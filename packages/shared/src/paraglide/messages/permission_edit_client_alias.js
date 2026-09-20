/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Edit_Client_AliasInputs */

const en_permission_edit_client_alias = /** @type {(inputs: Permission_Edit_Client_AliasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit client alias`)
};

const es_permission_edit_client_alias = /** @type {(inputs: Permission_Edit_Client_AliasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar alias del cliente`)
};

/**
* | output |
* | --- |
* | "Edit client alias" |
*
* @param {Permission_Edit_Client_AliasInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_edit_client_alias = /** @type {((inputs?: Permission_Edit_Client_AliasInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Edit_Client_AliasInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_edit_client_alias(inputs)
	return en_permission_edit_client_alias(inputs)
});