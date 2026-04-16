/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_A11y_Issues_FoundInputs */

const en_library_a11y_issues_found = /** @type {(inputs: Library_A11y_Issues_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} accessibility issues found`)
};

const es_library_a11y_issues_found = /** @type {(inputs: Library_A11y_Issues_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} problemas de accesibilidad encontrados`)
};

/**
* | output |
* | --- |
* | "{count} accessibility issues found" |
*
* @param {Library_A11y_Issues_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_issues_found = /** @type {((inputs: Library_A11y_Issues_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_A11y_Issues_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_a11y_issues_found(inputs)
	return es_library_a11y_issues_found(inputs)
});