/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_DoneInputs */

const en_admin_rotation_done = /** @type {(inputs: Admin_Rotation_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OK`)
};

const es_admin_rotation_done = /** @type {(inputs: Admin_Rotation_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OK`)
};

const en_xa2_admin_rotation_done = /** @type {(inputs: Admin_Rotation_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ÒK •⟧`)
};

/**
* | output |
* | --- |
* | "OK" |
*
* @param {Admin_Rotation_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_done = /** @type {((inputs?: Admin_Rotation_DoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_DoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_done(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_done(inputs)
	return en_admin_rotation_done(inputs)
});