/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Error_GenericInputs */

const en_intake_error_generic = /** @type {(inputs: Intake_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your message didn't go through. Nothing was sent. Try again.`)
};

const es_intake_error_generic = /** @type {(inputs: Intake_Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu mensaje no se envio. No se envio nada. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Your message didn't go through. Nothing was sent. Try again." |
*
* @param {Intake_Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_generic = /** @type {((inputs?: Intake_Error_GenericInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Error_GenericInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_error_generic(inputs)
	return es_intake_error_generic(inputs)
});