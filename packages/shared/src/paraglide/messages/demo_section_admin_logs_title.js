/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Logs_TitleInputs */

const en_demo_section_admin_logs_title = /** @type {(inputs: Demo_Section_Admin_Logs_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Logs`)
};

const es_demo_section_admin_logs_title = /** @type {(inputs: Demo_Section_Admin_Logs_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registros`)
};

/**
* | output |
* | --- |
* | "Logs" |
*
* @param {Demo_Section_Admin_Logs_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_logs_title = /** @type {((inputs?: Demo_Section_Admin_Logs_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Logs_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_logs_title(inputs)
	return en_demo_section_admin_logs_title(inputs)
});