/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_ErrorInputs */

const en_admin_rotation_error = /** @type {(inputs: Admin_Rotation_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key rotation failed. Your previous key is still active.`)
};

const es_admin_rotation_error = /** @type {(inputs: Admin_Rotation_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La rotacion de clave fallo. Tu clave anterior sigue activa.`)
};

/**
* | output |
* | --- |
* | "Key rotation failed. Your previous key is still active." |
*
* @param {Admin_Rotation_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_error = /** @type {((inputs?: Admin_Rotation_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_rotation_error(inputs)
	return es_admin_rotation_error(inputs)
});