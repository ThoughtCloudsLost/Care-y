/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Self_DependencyInputs */

const en_error_self_dependency = /** @type {(inputs: Error_Self_DependencyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A ticket cannot depend on itself.`)
};

const es_error_self_dependency = /** @type {(inputs: Error_Self_DependencyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un ticket no puede depender de sí mismo.`)
};

/**
* | output |
* | --- |
* | "A ticket cannot depend on itself." |
*
* @param {Error_Self_DependencyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_self_dependency = /** @type {((inputs?: Error_Self_DependencyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Self_DependencyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_self_dependency(inputs)
	return es_error_self_dependency(inputs)
});