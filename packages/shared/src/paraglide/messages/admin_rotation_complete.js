/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_CompleteInputs */

const en_admin_rotation_complete = /** @type {(inputs: Admin_Rotation_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key rotation complete`)
};

const es_admin_rotation_complete = /** @type {(inputs: Admin_Rotation_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotacion de clave completada`)
};

/**
* | output |
* | --- |
* | "Key rotation complete" |
*
* @param {Admin_Rotation_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_complete = /** @type {((inputs?: Admin_Rotation_CompleteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_CompleteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_rotation_complete(inputs)
	return es_admin_rotation_complete(inputs)
});