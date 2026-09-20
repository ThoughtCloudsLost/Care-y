/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Edit_Client_ContactInputs */

const en_permission_edit_client_contact = /** @type {(inputs: Permission_Edit_Client_ContactInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit client contact`)
};

const es_permission_edit_client_contact = /** @type {(inputs: Permission_Edit_Client_ContactInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar contacto del cliente`)
};

const en_xa2_permission_edit_client_contact = /** @type {(inputs: Permission_Edit_Client_ContactInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt clìènt còntàct ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Edit client contact" |
*
* @param {Permission_Edit_Client_ContactInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_edit_client_contact = /** @type {((inputs?: Permission_Edit_Client_ContactInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Edit_Client_ContactInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_edit_client_contact(inputs)
	if (locale === "en-XA") return en_xa2_permission_edit_client_contact(inputs)
	return en_permission_edit_client_contact(inputs)
});