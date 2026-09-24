/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Page_Issues_HeadingInputs */

const en_intake_page_issues_heading = /** @type {(inputs: Intake_Page_Issues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Please review the following:`)
};

const es_intake_page_issues_heading = /** @type {(inputs: Intake_Page_Issues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Por favor revisa lo siguiente:`)
};

const en_xa2_intake_page_issues_heading = /** @type {(inputs: Intake_Page_Issues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Plèàsè rèvìèw thè fòllòwìng: •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Please review the following:" |
*
* @param {Intake_Page_Issues_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_page_issues_heading = /** @type {((inputs?: Intake_Page_Issues_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Page_Issues_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_page_issues_heading(inputs)
	if (locale === "en-XA") return en_xa2_intake_page_issues_heading(inputs)
	return en_intake_page_issues_heading(inputs)
});