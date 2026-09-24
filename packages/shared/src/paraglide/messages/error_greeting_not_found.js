/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Greeting_Not_FoundInputs */

const en_error_greeting_not_found = /** @type {(inputs: Error_Greeting_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greeting not found.`)
};

const es_error_greeting_not_found = /** @type {(inputs: Error_Greeting_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludo no encontrado.`)
};

const en_xa2_error_greeting_not_found = /** @type {(inputs: Error_Greeting_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Grèètìng nòt fòùnd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Greeting not found." |
*
* @param {Error_Greeting_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_greeting_not_found = /** @type {((inputs?: Error_Greeting_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Greeting_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_greeting_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_greeting_not_found(inputs)
	return en_error_greeting_not_found(inputs)
});