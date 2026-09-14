/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Error_Email_Hash_ConflictInputs */

const en_error_email_hash_conflict = /** @type {(inputs: Error_Email_Hash_ConflictInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`That email address belongs to another ${i?.client}.`)
};

const es_error_email_hash_conflict = /** @type {(inputs: Error_Email_Hash_ConflictInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esa dirección de correo pertenece a otro ${i?.client}.`)
};

/**
* | output |
* | --- |
* | "That email address belongs to another {client}." |
*
* @param {Error_Email_Hash_ConflictInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_email_hash_conflict = /** @type {((inputs: Error_Email_Hash_ConflictInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Email_Hash_ConflictInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_email_hash_conflict(inputs)
	return en_error_email_hash_conflict(inputs)
});