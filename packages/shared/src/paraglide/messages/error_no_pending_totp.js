/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Pending_TotpInputs */

const en_error_no_pending_totp = /** @type {(inputs: Error_No_Pending_TotpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No pending authenticator setup found. Please start again.`)
};

const es_error_no_pending_totp = /** @type {(inputs: Error_No_Pending_TotpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontró una configuración pendiente de autenticador. Comienza de nuevo.`)
};

/**
* | output |
* | --- |
* | "No pending authenticator setup found. Please start again." |
*
* @param {Error_No_Pending_TotpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_pending_totp = /** @type {((inputs?: Error_No_Pending_TotpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Pending_TotpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_no_pending_totp(inputs)
	return es_error_no_pending_totp(inputs)
});