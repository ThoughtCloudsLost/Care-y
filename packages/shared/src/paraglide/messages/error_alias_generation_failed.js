/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Error_Alias_Generation_FailedInputs */

const en_error_alias_generation_failed = /** @type {(inputs: Error_Alias_Generation_FailedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Could not generate a unique ${i?.client} alias. Please try again.`)
};

const es_error_alias_generation_failed = /** @type {(inputs: Error_Alias_Generation_FailedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se pudo generar un alias único para el ${i?.client}. Inténtalo de nuevo.`)
};

/**
* | output |
* | --- |
* | "Could not generate a unique {client} alias. Please try again." |
*
* @param {Error_Alias_Generation_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_alias_generation_failed = /** @type {((inputs: Error_Alias_Generation_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Alias_Generation_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_alias_generation_failed(inputs)
	return es_error_alias_generation_failed(inputs)
});