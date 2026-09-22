/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ page: NonNullable<unknown>, field: NonNullable<unknown>, error: NonNullable<unknown> }} Intake_Page_Issue_Row_With_PageInputs */

const en_intake_page_issue_row_with_page = /** @type {(inputs: Intake_Page_Issue_Row_With_PageInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Step ${i?.page}: ${i?.field}: ${i?.error}`)
};

const es_intake_page_issue_row_with_page = /** @type {(inputs: Intake_Page_Issue_Row_With_PageInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Paso ${i?.page}: ${i?.field}: ${i?.error}`)
};

const en_xa2_intake_page_issue_row_with_page = /** @type {(inputs: Intake_Page_Issue_Row_With_PageInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Stèp  ••${i?.page}:  •${i?.field}:  •${i?.error}⟧`)
};

/**
* | output |
* | --- |
* | "Step {page}: {field}: {error}" |
*
* @param {Intake_Page_Issue_Row_With_PageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_issue_row_with_page = /** @type {((inputs: Intake_Page_Issue_Row_With_PageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_Issue_Row_With_PageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_page_issue_row_with_page(inputs)
	if (locale === "en-XA") return en_xa2_intake_page_issue_row_with_page(inputs)
	return en_intake_page_issue_row_with_page(inputs)
});