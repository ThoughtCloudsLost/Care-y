/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_Note_TypesInputs */

const en_admin_tab_note_types = /** @type {(inputs: Admin_Tab_Note_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Follow-Ups`)
};

const es_admin_tab_note_types = /** @type {(inputs: Admin_Tab_Note_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seguimientos`)
};

/**
* | output |
* | --- |
* | "Follow-Ups" |
*
* @param {Admin_Tab_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_note_types = /** @type {((inputs?: Admin_Tab_Note_TypesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_Note_TypesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_note_types(inputs)
	return es_admin_tab_note_types(inputs)
});