/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_TitleInputs */

const en_demo_section_admin_title = /** @type {(inputs: Demo_Section_Admin_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Admin hub`)
};

const es_demo_section_admin_title = /** @type {(inputs: Demo_Section_Admin_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Centro de administracion`)
};

/**
* | output |
* | --- |
* | "Admin hub" |
*
* @param {Demo_Section_Admin_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_title = /** @type {((inputs?: Demo_Section_Admin_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_admin_title(inputs)
	return es_demo_section_admin_title(inputs)
});