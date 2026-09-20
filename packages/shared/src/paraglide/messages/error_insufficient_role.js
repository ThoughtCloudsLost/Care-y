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

const en_xa2_error_insufficient_role = /** @type {(inputs: Error_Insufficient_RoleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr ròlè dòès nòt hàvè àccèss tò thìs nòtè typè. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your role does not have access to this note type." |
*
* @param {Error_Insufficient_RoleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_insufficient_role = /** @type {((inputs?: Error_Insufficient_RoleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Insufficient_RoleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_insufficient_role(inputs)
	if (locale === "en-XA") return en_xa2_error_insufficient_role(inputs)
	return en_error_insufficient_role(inputs)
});