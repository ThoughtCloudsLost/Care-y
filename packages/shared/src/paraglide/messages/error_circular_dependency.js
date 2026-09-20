/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Circular_DependencyInputs */

const en_error_circular_dependency = /** @type {(inputs: Error_Circular_DependencyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Circular dependency detected.`)
};

const es_error_circular_dependency = /** @type {(inputs: Error_Circular_DependencyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se detectó una dependencia circular.`)
};

const en_xa2_error_circular_dependency = /** @type {(inputs: Error_Circular_DependencyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cìrcùlàr dèpèndèncy dètèctèd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Circular dependency detected." |
*
* @param {Error_Circular_DependencyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_circular_dependency = /** @type {((inputs?: Error_Circular_DependencyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Circular_DependencyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_circular_dependency(inputs)
	if (locale === "en-XA") return en_xa2_error_circular_dependency(inputs)
	return en_error_circular_dependency(inputs)
});