/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Page_Break_Title_PlaceholderInputs */

const en_intake_forms_page_break_title_placeholder = /** @type {(inputs: Intake_Forms_Page_Break_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`e.g. Contact information`)
};

const es_intake_forms_page_break_title_placeholder = /** @type {(inputs: Intake_Forms_Page_Break_Title_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`ej. Informacion de contacto`)
};

/**
* | output |
* | --- |
* | "e.g. Contact information" |
*
* @param {Intake_Forms_Page_Break_Title_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_page_break_title_placeholder = /** @type {((inputs?: Intake_Forms_Page_Break_Title_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Page_Break_Title_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_page_break_title_placeholder(inputs)
	return es_intake_forms_page_break_title_placeholder(inputs)
});