/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Page_Break_DividerInputs */

const en_intake_forms_page_break_divider = /** @type {(inputs: Intake_Forms_Page_Break_DividerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Page break`)
};

const es_intake_forms_page_break_divider = /** @type {(inputs: Intake_Forms_Page_Break_DividerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Salto de página`)
};

const en_xa2_intake_forms_page_break_divider = /** @type {(inputs: Intake_Forms_Page_Break_DividerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pàgè brèàk •••⟧`)
};

/**
* | output |
* | --- |
* | "Page break" |
*
* @param {Intake_Forms_Page_Break_DividerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_page_break_divider = /** @type {((inputs?: Intake_Forms_Page_Break_DividerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Page_Break_DividerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_page_break_divider(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_page_break_divider(inputs)
	return en_intake_forms_page_break_divider(inputs)
});