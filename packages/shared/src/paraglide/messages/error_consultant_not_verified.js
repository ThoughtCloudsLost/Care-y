/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Consultant_Not_VerifiedInputs */

const en_error_consultant_not_verified = /** @type {(inputs: Error_Consultant_Not_VerifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your phone number has not been verified.`)
};

const es_error_consultant_not_verified = /** @type {(inputs: Error_Consultant_Not_VerifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu numero de telefono no ha sido verificado.`)
};

/**
* | output |
* | --- |
* | "Your phone number has not been verified." |
*
* @param {Error_Consultant_Not_VerifiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_consultant_not_verified = /** @type {((inputs?: Error_Consultant_Not_VerifiedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Consultant_Not_VerifiedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_consultant_not_verified(inputs)
	return es_error_consultant_not_verified(inputs)
});