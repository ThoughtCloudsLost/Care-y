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

const en_xa2_library_a11y_no_issues = /** @type {(inputs: Library_A11y_No_IssuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò àccèssìbìlìty ìssùès •••••••⟧`)
};

/**
* | output |
* | --- |
* | "No accessibility issues" |
*
* @param {Library_A11y_No_IssuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_a11y_no_issues = /** @type {((inputs?: Library_A11y_No_IssuesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_A11y_No_IssuesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_a11y_no_issues(inputs)
	if (locale === "en-XA") return en_xa2_library_a11y_no_issues(inputs)
	return en_library_a11y_no_issues(inputs)
});