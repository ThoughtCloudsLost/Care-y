/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ seconds: NonNullable<unknown> }} Error_Retry_After_SecondsInputs */

const en_error_retry_after_seconds = /** @type {(inputs: Error_Retry_After_SecondsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Too many attempts. Try again in ${i?.seconds} seconds.`)
};

const es_error_retry_after_seconds = /** @type {(inputs: Error_Retry_After_SecondsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Demasiados intentos. Intenta de nuevo en ${i?.seconds} segundos.`)
};

const en_xa2_error_retry_after_seconds = /** @type {(inputs: Error_Retry_After_SecondsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Tòò màny àttèmpts. Try àgàìn ìn  ••••••••••${i?.seconds} sècònds. •••⟧`)
};

/**
* | output |
* | --- |
* | "Too many attempts. Try again in {seconds} seconds." |
*
* @param {Error_Retry_After_SecondsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_retry_after_seconds = /** @type {((inputs: Error_Retry_After_SecondsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Retry_After_SecondsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_retry_after_seconds(inputs)
	if (locale === "en-XA") return en_xa2_error_retry_after_seconds(inputs)
	return en_error_retry_after_seconds(inputs)
});