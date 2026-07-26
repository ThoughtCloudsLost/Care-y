/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ alias: NonNullable<unknown> }} Client_Phone_Conflict_BodyInputs */

const en_client_phone_conflict_body = /** @type {(inputs: Client_Phone_Conflict_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This number belongs to ${i?.alias}. Merge instead?`)
};

const es_client_phone_conflict_body = /** @type {(inputs: Client_Phone_Conflict_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este numero pertenece a ${i?.alias}. Fusionar en su lugar?`)
};

/**
* | output |
* | --- |
* | "This number belongs to {alias}. Merge instead?" |
*
* @param {Client_Phone_Conflict_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_conflict_body = /** @type {((inputs: Client_Phone_Conflict_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Conflict_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_phone_conflict_body(inputs)
	return es_client_phone_conflict_body(inputs)
});