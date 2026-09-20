/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_GenericInputs */

const en_error_generic = /** @type {(inputs: Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Something went wrong. Please try again.`)
};

const es_error_generic = /** @type {(inputs: Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Algo salió mal. Por favor, inténtalo de nuevo.`)
};

const en_xa2_error_generic = /** @type {(inputs: Error_GenericInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòmèthìng wènt wròng. Plèàsè try àgàìn. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Something went wrong. Please try again." |
*
* @param {Error_GenericInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_generic = /** @type {((inputs?: Error_GenericInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_GenericInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_generic(inputs)
	if (locale === "en-XA") return en_xa2_error_generic(inputs)
	return en_error_generic(inputs)
});