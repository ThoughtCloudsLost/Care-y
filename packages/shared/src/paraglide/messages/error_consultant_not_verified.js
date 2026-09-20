/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Consultant_Not_VerifiedInputs */

const en_error_consultant_not_verified = /** @type {(inputs: Error_Consultant_Not_VerifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your phone number has not been verified.`)
};

const es_error_consultant_not_verified = /** @type {(inputs: Error_Consultant_Not_VerifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu número de teléfono no ha sido verificado.`)
};

const en_xa2_error_consultant_not_verified = /** @type {(inputs: Error_Consultant_Not_VerifiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr phònè nùmbèr hàs nòt bèèn vèrìfìèd. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your phone number has not been verified." |
*
* @param {Error_Consultant_Not_VerifiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_consultant_not_verified = /** @type {((inputs?: Error_Consultant_Not_VerifiedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Consultant_Not_VerifiedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_consultant_not_verified(inputs)
	if (locale === "en-XA") return en_xa2_error_consultant_not_verified(inputs)
	return en_error_consultant_not_verified(inputs)
});