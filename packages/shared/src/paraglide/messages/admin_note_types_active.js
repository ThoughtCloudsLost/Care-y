/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Note_Types_ActiveInputs */

const en_admin_note_types_active = /** @type {(inputs: Admin_Note_Types_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Active`)
};

const es_admin_note_types_active = /** @type {(inputs: Admin_Note_Types_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activo`)
};

const en_xa2_admin_note_types_active = /** @type {(inputs: Admin_Note_Types_ActiveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctìvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Active" |
*
* @param {Admin_Note_Types_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_active = /** @type {((inputs?: Admin_Note_Types_ActiveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_ActiveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_active(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_active(inputs)
	return en_admin_note_types_active(inputs)
});