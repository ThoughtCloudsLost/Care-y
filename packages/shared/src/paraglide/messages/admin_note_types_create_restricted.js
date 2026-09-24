/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ role: NonNullable<unknown> }} Admin_Note_Types_Create_RestrictedInputs */

const en_admin_note_types_create_restricted = /** @type {(inputs: Admin_Note_Types_Create_RestrictedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create: ${i?.role}+`)
};

const es_admin_note_types_create_restricted = /** @type {(inputs: Admin_Note_Types_Create_RestrictedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crear: ${i?.role}+`)
};

const en_xa2_admin_note_types_create_restricted = /** @type {(inputs: Admin_Note_Types_Create_RestrictedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè:  •••${i?.role}+ •⟧`)
};

/**
* | output |
* | --- |
* | "Create: {role}+" |
*
* @param {Admin_Note_Types_Create_RestrictedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_create_restricted = /** @type {((inputs: Admin_Note_Types_Create_RestrictedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Note_Types_Create_RestrictedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_note_types_create_restricted(inputs)
	if (locale === "en-XA") return en_xa2_admin_note_types_create_restricted(inputs)
	return en_admin_note_types_create_restricted(inputs)
});