/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_CompleteInputs */

const en_admin_rotation_complete = /** @type {(inputs: Admin_Rotation_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Key rotation complete`)
};

const es_admin_rotation_complete = /** @type {(inputs: Admin_Rotation_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rotación de clave completada`)
};

const en_xa2_admin_rotation_complete = /** @type {(inputs: Admin_Rotation_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Kèy ròtàtìòn còmplètè •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Key rotation complete" |
*
* @param {Admin_Rotation_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_complete = /** @type {((inputs?: Admin_Rotation_CompleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_CompleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_complete(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_complete(inputs)
	return en_admin_rotation_complete(inputs)
});