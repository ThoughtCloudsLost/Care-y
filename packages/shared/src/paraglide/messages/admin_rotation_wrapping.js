/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Rotation_WrappingInputs */

const en_admin_rotation_wrapping = /** @type {(inputs: Admin_Rotation_WrappingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Wrapping key for ${i?.count} volunteers...`)
};

const es_admin_rotation_wrapping = /** @type {(inputs: Admin_Rotation_WrappingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Envolviendo clave para ${i?.count} voluntarios...`)
};

const en_xa2_admin_rotation_wrapping = /** @type {(inputs: Admin_Rotation_WrappingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Wràppìng kèy fòr  ••••••${i?.count} vòlùntèèrs... •••••⟧`)
};

/**
* | output |
* | --- |
* | "Wrapping key for {count} volunteers..." |
*
* @param {Admin_Rotation_WrappingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_wrapping = /** @type {((inputs: Admin_Rotation_WrappingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_WrappingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_wrapping(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_wrapping(inputs)
	return en_admin_rotation_wrapping(inputs)
});