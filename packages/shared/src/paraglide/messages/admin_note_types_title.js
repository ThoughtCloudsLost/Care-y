/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_TitleInputs */

const en_admin_note_types_title = /** @type {(inputs: Admin_Note_Types_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Follow-Up Types`)
};

const es_admin_note_types_title = /** @type {(inputs: Admin_Note_Types_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipos de seguimiento`)
};

/**
* | output |
* | --- |
* | "Follow-Up Types" |
*
* @param {Admin_Note_Types_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_title = /** @type {((inputs?: Admin_Note_Types_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_title(inputs)
	return es_admin_note_types_title(inputs)
});