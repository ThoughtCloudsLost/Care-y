/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Write_Case_NotesInputs */

const en_permission_write_case_notes = /** @type {(inputs: Permission_Write_Case_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write case notes`)
};

const es_permission_write_case_notes = /** @type {(inputs: Permission_Write_Case_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribir notas del caso`)
};

const en_xa2_permission_write_case_notes = /** @type {(inputs: Permission_Write_Case_NotesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wrìtè càsè nòtès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Write case notes" |
*
* @param {Permission_Write_Case_NotesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_write_case_notes = /** @type {((inputs?: Permission_Write_Case_NotesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Write_Case_NotesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_write_case_notes(inputs)
	if (locale === "en-XA") return en_xa2_permission_write_case_notes(inputs)
	return en_permission_write_case_notes(inputs)
});