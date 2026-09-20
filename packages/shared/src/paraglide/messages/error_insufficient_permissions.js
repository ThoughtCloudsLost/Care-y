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

const en_xa2_error_insufficient_permissions = /** @type {(inputs: Error_Insufficient_PermissionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù dò nòt hàvè pèrmìssìòn tò dò thìs. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You do not have permission to do this." |
*
* @param {Error_Insufficient_PermissionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_insufficient_permissions = /** @type {((inputs?: Error_Insufficient_PermissionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Insufficient_PermissionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_insufficient_permissions(inputs)
	if (locale === "en-XA") return en_xa2_error_insufficient_permissions(inputs)
	return en_error_insufficient_permissions(inputs)
});