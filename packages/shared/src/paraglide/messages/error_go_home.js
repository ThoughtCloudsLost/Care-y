/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Go_HomeInputs */

const en_error_go_home = /** @type {(inputs: Error_Go_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go home`)
};

const es_error_go_home = /** @type {(inputs: Error_Go_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ir al inicio`)
};

const en_xa2_error_go_home = /** @type {(inputs: Error_Go_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gò hòmè •••⟧`)
};

/**
* | output |
* | --- |
* | "Go home" |
*
* @param {Error_Go_HomeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_go_home = /** @type {((inputs?: Error_Go_HomeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Go_HomeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_go_home(inputs)
	if (locale === "en-XA") return en_xa2_error_go_home(inputs)
	return en_error_go_home(inputs)
});