/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_ConfirmInputs */

const en_admin_rotation_confirm = /** @type {(inputs: Admin_Rotation_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotate Key`)
};

const es_admin_rotation_confirm = /** @type {(inputs: Admin_Rotation_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotar clave`)
};

const en_xa2_admin_rotation_confirm = /** @type {(inputs: Admin_Rotation_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròtàtè Kèy •••⟧`)
};

/**
* | output |
* | --- |
* | "Rotate Key" |
*
* @param {Admin_Rotation_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_confirm = /** @type {((inputs?: Admin_Rotation_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_confirm(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_confirm(inputs)
	return en_admin_rotation_confirm(inputs)
});