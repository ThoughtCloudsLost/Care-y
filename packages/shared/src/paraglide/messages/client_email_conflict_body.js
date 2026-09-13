/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ alias: NonNullable<unknown> }} Client_Email_Conflict_BodyInputs */

const en_client_email_conflict_body = /** @type {(inputs: Client_Email_Conflict_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This address belongs to ${i?.alias}. Merge instead?`)
};

const es_client_email_conflict_body = /** @type {(inputs: Client_Email_Conflict_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esta dirección pertenece a ${i?.alias}. ¿Fusionar en su lugar?`)
};

/**
* | output |
* | --- |
* | "This address belongs to {alias}. Merge instead?" |
*
* @param {Client_Email_Conflict_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_conflict_body = /** @type {((inputs: Client_Email_Conflict_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Email_Conflict_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_email_conflict_body(inputs)
	return es_client_email_conflict_body(inputs)
});