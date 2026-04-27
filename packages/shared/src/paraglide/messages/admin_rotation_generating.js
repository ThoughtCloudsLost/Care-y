/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_GeneratingInputs */

const en_admin_rotation_generating = /** @type {(inputs: Admin_Rotation_GeneratingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generating new key...`)
};

const es_admin_rotation_generating = /** @type {(inputs: Admin_Rotation_GeneratingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generando nueva clave...`)
};

/**
* | output |
* | --- |
* | "Generating new key..." |
*
* @param {Admin_Rotation_GeneratingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_generating = /** @type {((inputs?: Admin_Rotation_GeneratingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_GeneratingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_rotation_generating(inputs)
	return es_admin_rotation_generating(inputs)
});