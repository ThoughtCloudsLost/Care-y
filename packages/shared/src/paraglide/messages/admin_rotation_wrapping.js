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

/**
* | output |
* | --- |
* | "Wrapping key for {count} volunteers..." |
*
* @param {Admin_Rotation_WrappingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_wrapping = /** @type {((inputs: Admin_Rotation_WrappingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_WrappingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_rotation_wrapping(inputs)
	return es_admin_rotation_wrapping(inputs)
});