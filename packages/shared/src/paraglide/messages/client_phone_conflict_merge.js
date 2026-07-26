/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ clients: NonNullable<unknown> }} Client_Phone_Conflict_MergeInputs */

const en_client_phone_conflict_merge = /** @type {(inputs: Client_Phone_Conflict_MergeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Merge ${i?.clients}`)
};

const es_client_phone_conflict_merge = /** @type {(inputs: Client_Phone_Conflict_MergeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Fusionar ${i?.clients}`)
};

/**
* | output |
* | --- |
* | "Merge {clients}" |
*
* @param {Client_Phone_Conflict_MergeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_conflict_merge = /** @type {((inputs: Client_Phone_Conflict_MergeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Conflict_MergeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_phone_conflict_merge(inputs)
	return es_client_phone_conflict_merge(inputs)
});