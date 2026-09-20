/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Note_TypesInputs */

const en_permission_manage_note_types = /** @type {(inputs: Permission_Manage_Note_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage note types`)
};

const es_permission_manage_note_types = /** @type {(inputs: Permission_Manage_Note_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar tipos de notas`)
};

const en_xa2_permission_manage_note_types = /** @type {(inputs: Permission_Manage_Note_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè nòtè typès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage note types" |
*
* @param {Permission_Manage_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_note_types = /** @type {((inputs?: Permission_Manage_Note_TypesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Note_TypesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_note_types(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_note_types(inputs)
	return en_permission_manage_note_types(inputs)
});