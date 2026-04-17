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

/**
* | output |
* | --- |
* | "OK" |
*
* @param {Admin_Rotation_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_done = /** @type {((inputs?: Admin_Rotation_DoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_DoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_rotation_done(inputs)
	return es_admin_rotation_done(inputs)
});