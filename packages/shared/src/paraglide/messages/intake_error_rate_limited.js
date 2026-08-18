/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ minutes: NonNullable<unknown> }} Intake_Error_Rate_LimitedInputs */

const en_intake_error_rate_limited = /** @type {(inputs: Intake_Error_Rate_LimitedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Too many messages from this connection. Try again in about ${i?.minutes} minutes, or call us.`)
};

const es_intake_error_rate_limited = /** @type {(inputs: Intake_Error_Rate_LimitedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Demasiados mensajes desde esta conexion. Intenta de nuevo en unos ${i?.minutes} minutos, o llamanos.`)
};

/**
* | output |
* | --- |
* | "Too many messages from this connection. Try again in about {minutes} minutes, or call us." |
*
* @param {Intake_Error_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_rate_limited = /** @type {((inputs: Intake_Error_Rate_LimitedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_Rate_LimitedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_rate_limited(inputs)
	return es_intake_error_rate_limited(inputs)
});