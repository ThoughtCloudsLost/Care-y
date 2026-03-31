/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Webauthn_Challenge_Not_FoundInputs */

const en_error_webauthn_challenge_not_found = /** @type {(inputs: Error_Webauthn_Challenge_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No security key challenge found. Please try again.`)
};

const es_error_webauthn_challenge_not_found = /** @type {(inputs: Error_Webauthn_Challenge_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontró el desafío de la llave de seguridad. Inténtalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "No security key challenge found. Please try again." |
*
* @param {Error_Webauthn_Challenge_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_webauthn_challenge_not_found = /** @type {((inputs?: Error_Webauthn_Challenge_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Webauthn_Challenge_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_webauthn_challenge_not_found(inputs)
	return es_error_webauthn_challenge_not_found(inputs)
});