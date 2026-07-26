/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Error_Phone_Hash_ConflictInputs */

const en_error_phone_hash_conflict = /** @type {(inputs: Error_Phone_Hash_ConflictInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`That phone number belongs to another ${i?.client}.`)
};

const es_error_phone_hash_conflict = /** @type {(inputs: Error_Phone_Hash_ConflictInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ese número de teléfono pertenece a otro ${i?.client}.`)
};

/**
* | output |
* | --- |
* | "That phone number belongs to another {client}." |
*
* @param {Error_Phone_Hash_ConflictInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_phone_hash_conflict = /** @type {((inputs: Error_Phone_Hash_ConflictInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Phone_Hash_ConflictInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_phone_hash_conflict(inputs)
	return es_error_phone_hash_conflict(inputs)
});