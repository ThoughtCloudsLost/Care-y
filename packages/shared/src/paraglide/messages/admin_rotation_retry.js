/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_RetryInputs */

const en_admin_rotation_retry = /** @type {(inputs: Admin_Rotation_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retry`)
};

const es_admin_rotation_retry = /** @type {(inputs: Admin_Rotation_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reintentar`)
};

const en_xa2_admin_rotation_retry = /** @type {(inputs: Admin_Rotation_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètry ••⟧`)
};

/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Admin_Rotation_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_retry = /** @type {((inputs?: Admin_Rotation_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_retry(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_retry(inputs)
	return en_admin_rotation_retry(inputs)
});