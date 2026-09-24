/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Active_CodeInputs */

const en_error_no_active_code = /** @type {(inputs: Error_No_Active_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No active verification code. Please request a new one.`)
};

const es_error_no_active_code = /** @type {(inputs: Error_No_Active_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay un código de verificación activo. Solicita uno nuevo.`)
};

const en_xa2_error_no_active_code = /** @type {(inputs: Error_No_Active_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò àctìvè vèrìfìcàtìòn còdè. Plèàsè rèqùèst à nèw ònè. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No active verification code. Please request a new one." |
*
* @param {Error_No_Active_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_no_active_code = /** @type {((inputs?: Error_No_Active_CodeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Active_CodeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_no_active_code(inputs)
	if (locale === "en-XA") return en_xa2_error_no_active_code(inputs)
	return en_error_no_active_code(inputs)
});