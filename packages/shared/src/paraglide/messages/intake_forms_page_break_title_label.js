/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Page_Break_Title_LabelInputs */

const en_intake_forms_page_break_title_label = /** @type {(inputs: Intake_Forms_Page_Break_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Page title (optional)`)
};

const es_intake_forms_page_break_title_label = /** @type {(inputs: Intake_Forms_Page_Break_Title_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Título de página (opcional)`)
};

/**
* | output |
* | --- |
* | "Page title (optional)" |
*
* @param {Intake_Forms_Page_Break_Title_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_page_break_title_label = /** @type {((inputs?: Intake_Forms_Page_Break_Title_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Page_Break_Title_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_page_break_title_label(inputs)
	return es_intake_forms_page_break_title_label(inputs)
});