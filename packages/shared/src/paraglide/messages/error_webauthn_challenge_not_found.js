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

const en_xa2_error_webauthn_challenge_not_found = /** @type {(inputs: Error_Webauthn_Challenge_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò sècùrìty kèy chàllèngè fòùnd. Plèàsè try àgàìn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No security key challenge found. Please try again." |
*
* @param {Error_Webauthn_Challenge_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_webauthn_challenge_not_found = /** @type {((inputs?: Error_Webauthn_Challenge_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Webauthn_Challenge_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_webauthn_challenge_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_webauthn_challenge_not_found(inputs)
	return en_error_webauthn_challenge_not_found(inputs)
});