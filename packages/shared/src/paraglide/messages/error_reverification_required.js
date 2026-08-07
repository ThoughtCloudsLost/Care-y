/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Reverification_RequiredInputs */

const en_error_reverification_required = /** @type {(inputs: Error_Reverification_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone re-verification is required to enable this feature.`)
};

const es_error_reverification_required = /** @type {(inputs: Error_Reverification_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se requiere volver a verificar el telefono para activar esta funcion.`)
};

/**
* | output |
* | --- |
* | "Phone re-verification is required to enable this feature." |
*
* @param {Error_Reverification_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_reverification_required = /** @type {((inputs?: Error_Reverification_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Reverification_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_reverification_required(inputs)
	return es_error_reverification_required(inputs)
});