/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Insufficient_PermissionsInputs */

const en_error_insufficient_permissions = /** @type {(inputs: Error_Insufficient_PermissionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You do not have permission to do this.`)
};

const es_error_insufficient_permissions = /** @type {(inputs: Error_Insufficient_PermissionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No tienes permiso para hacer esto.`)
};

/**
* | output |
* | --- |
* | "You do not have permission to do this." |
*
* @param {Error_Insufficient_PermissionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_insufficient_permissions = /** @type {((inputs?: Error_Insufficient_PermissionsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Insufficient_PermissionsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_insufficient_permissions(inputs)
	return es_error_insufficient_permissions(inputs)
});