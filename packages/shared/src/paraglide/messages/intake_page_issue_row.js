/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ field: NonNullable<unknown>, error: NonNullable<unknown> }} Intake_Page_Issue_RowInputs */

const en_intake_page_issue_row = /** @type {(inputs: Intake_Page_Issue_RowInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.field}: ${i?.error}`)
};

const es_intake_page_issue_row = /** @type {(inputs: Intake_Page_Issue_RowInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.field}: ${i?.error}`)
};

const en_xa2_intake_page_issue_row = /** @type {(inputs: Intake_Page_Issue_RowInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.field}:  •${i?.error}⟧`)
};

/**
* | output |
* | --- |
* | "{field}: {error}" |
*
* @param {Intake_Page_Issue_RowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_issue_row = /** @type {((inputs: Intake_Page_Issue_RowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_Issue_RowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_page_issue_row(inputs)
	if (locale === "en-XA") return en_xa2_intake_page_issue_row(inputs)
	return en_intake_page_issue_row(inputs)
});