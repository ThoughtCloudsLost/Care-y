/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Twofa_Session_EndedInputs */

const en_error_twofa_session_ended = /** @type {(inputs: Error_Twofa_Session_EndedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Too many incorrect codes. Sign in again to continue.`)
};

const es_error_twofa_session_ended = /** @type {(inputs: Error_Twofa_Session_EndedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Demasiados códigos incorrectos. Vuelve a iniciar sesión para continuar.`)
};

const en_xa2_error_twofa_session_ended = /** @type {(inputs: Error_Twofa_Session_EndedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tòò màny ìncòrrèct còdès. Sìgn ìn àgàìn tò còntìnùè. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Too many incorrect codes. Sign in again to continue." |
*
* @param {Error_Twofa_Session_EndedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_twofa_session_ended = /** @type {((inputs?: Error_Twofa_Session_EndedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Twofa_Session_EndedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_twofa_session_ended(inputs)
	if (locale === "en-XA") return en_xa2_error_twofa_session_ended(inputs)
	return en_error_twofa_session_ended(inputs)
});