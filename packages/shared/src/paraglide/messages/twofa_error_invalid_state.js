/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Twofa_Error_Invalid_StateInputs */

const en_twofa_error_invalid_state = /** @type {(inputs: Twofa_Error_Invalid_StateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This authenticator is already registered.`)
};

const es_twofa_error_invalid_state = /** @type {(inputs: Twofa_Error_Invalid_StateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este autenticador ya está registrado.`)
};

const en_xa2_twofa_error_invalid_state = /** @type {(inputs: Twofa_Error_Invalid_StateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs àùthèntìcàtòr ìs àlrèàdy règìstèrèd. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This authenticator is already registered." |
*
* @param {Twofa_Error_Invalid_StateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_invalid_state = /** @type {((inputs?: Twofa_Error_Invalid_StateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Twofa_Error_Invalid_StateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_twofa_error_invalid_state(inputs)
	if (locale === "en-XA") return en_xa2_twofa_error_invalid_state(inputs)
	return en_twofa_error_invalid_state(inputs)
});