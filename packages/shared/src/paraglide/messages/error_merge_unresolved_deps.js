/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Merge_Unresolved_DepsInputs */

const en_error_merge_unresolved_deps = /** @type {(inputs: Error_Merge_Unresolved_DepsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cannot merge: the secondary client's ticket has unresolved dependencies.`)
};

const es_error_merge_unresolved_deps = /** @type {(inputs: Error_Merge_Unresolved_DepsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se puede fusionar: el ticket del cliente secundario tiene dependencias sin resolver.`)
};

/**
* | output |
* | --- |
* | "Cannot merge: the secondary client's ticket has unresolved dependencies." |
*
* @param {Error_Merge_Unresolved_DepsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_merge_unresolved_deps = /** @type {((inputs?: Error_Merge_Unresolved_DepsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Merge_Unresolved_DepsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_merge_unresolved_deps(inputs)
	return es_error_merge_unresolved_deps(inputs)
});