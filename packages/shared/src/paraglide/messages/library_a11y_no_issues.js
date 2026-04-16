/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_A11y_No_IssuesInputs */

const en_library_a11y_no_issues = /** @type {(inputs: Library_A11y_No_IssuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No accessibility issues`)
};

const es_library_a11y_no_issues = /** @type {(inputs: Library_A11y_No_IssuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin problemas de accesibilidad`)
};

/**
* | output |
* | --- |
* | "No accessibility issues" |
*
* @param {Library_A11y_No_IssuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_a11y_no_issues = /** @type {((inputs?: Library_A11y_No_IssuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_A11y_No_IssuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_a11y_no_issues(inputs)
	return es_library_a11y_no_issues(inputs)
});