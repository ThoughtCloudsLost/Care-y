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

const en_xa2_admin_rotation_generating = /** @type {(inputs: Admin_Rotation_GeneratingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gènèràtìng nèw kèy... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Generating new key..." |
*
* @param {Admin_Rotation_GeneratingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_generating = /** @type {((inputs?: Admin_Rotation_GeneratingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_GeneratingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_generating(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_generating(inputs)
	return en_admin_rotation_generating(inputs)
});