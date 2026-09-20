/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ role: NonNullable<unknown> }} Admin_Note_Types_View_RestrictedInputs */

const en_admin_note_types_view_restricted = /** @type {(inputs: Admin_Note_Types_View_RestrictedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`View: ${i?.role}+`)
};

const es_admin_note_types_view_restricted = /** @type {(inputs: Admin_Note_Types_View_RestrictedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ver: ${i?.role}+`)
};

const en_xa2_admin_note_types_view_restricted = /** @type {(inputs: Admin_Note_Types_View_RestrictedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Vìèw:  ••${i?.role}+ •⟧`)
};

/**
* | output |
* | --- |
* | "View: {role}+" |
*
* @param {Admin_Note_Types_View_RestrictedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_view_restricted = /** @type {((inputs: Admin_Note_Types_View_RestrictedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_View_RestrictedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_view_restricted(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_view_restricted(inputs)
	return en_admin_note_types_view_restricted(inputs)
});