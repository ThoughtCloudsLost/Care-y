/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Forms_TitleInputs */

const en_demo_section_admin_forms_title = /** @type {(inputs: Demo_Section_Admin_Forms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Form builder`)
};

const es_demo_section_admin_forms_title = /** @type {(inputs: Demo_Section_Admin_Forms_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Constructor de formularios`)
};

/**
* | output |
* | --- |
* | "Form builder" |
*
* @param {Demo_Section_Admin_Forms_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_forms_title = /** @type {((inputs?: Demo_Section_Admin_Forms_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Forms_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_forms_title(inputs)
	return en_demo_section_admin_forms_title(inputs)
});