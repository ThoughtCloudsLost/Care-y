/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_Close_RequiredInputs */

const en_admin_note_types_close_required = /** @type {(inputs: Admin_Note_Types_Close_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Required on close`)
};

const es_admin_note_types_close_required = /** @type {(inputs: Admin_Note_Types_Close_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Requerido al cerrar`)
};

/**
* | output |
* | --- |
* | "Required on close" |
*
* @param {Admin_Note_Types_Close_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_close_required = /** @type {((inputs?: Admin_Note_Types_Close_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Close_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_note_types_close_required(inputs)
	return es_admin_note_types_close_required(inputs)
});