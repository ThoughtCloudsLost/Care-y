/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Insufficient_RoleInputs */

const en_error_insufficient_role = /** @type {(inputs: Error_Insufficient_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your role does not have access to this note type.`)
};

const es_error_insufficient_role = /** @type {(inputs: Error_Insufficient_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu rol no tiene acceso a este tipo de nota.`)
};

/**
* | output |
* | --- |
* | "Your role does not have access to this note type." |
*
* @param {Error_Insufficient_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_insufficient_role = /** @type {((inputs?: Error_Insufficient_RoleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Insufficient_RoleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_insufficient_role(inputs)
	return es_error_insufficient_role(inputs)
});