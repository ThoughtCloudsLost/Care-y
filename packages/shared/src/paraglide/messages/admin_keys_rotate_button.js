/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Keys_Rotate_ButtonInputs */

const en_admin_keys_rotate_button = /** @type {(inputs: Admin_Keys_Rotate_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotate Org Key`)
};

const es_admin_keys_rotate_button = /** @type {(inputs: Admin_Keys_Rotate_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotar clave org`)
};

const en_xa2_admin_keys_rotate_button = /** @type {(inputs: Admin_Keys_Rotate_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròtàtè Òrg Kèy •••••⟧`)
};

/**
* | output |
* | --- |
* | "Rotate Org Key" |
*
* @param {Admin_Keys_Rotate_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_keys_rotate_button = /** @type {((inputs?: Admin_Keys_Rotate_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_Rotate_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_keys_rotate_button(inputs)
	if (locale === "en-XA") return en_xa2_admin_keys_rotate_button(inputs)
	return en_admin_keys_rotate_button(inputs)
});