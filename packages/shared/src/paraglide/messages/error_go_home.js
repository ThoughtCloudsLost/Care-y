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

/**
* | output |
* | --- |
* | "Go home" |
*
* @param {Error_Go_HomeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_go_home = /** @type {((inputs?: Error_Go_HomeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Go_HomeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_go_home(inputs)
	return es_error_go_home(inputs)
});