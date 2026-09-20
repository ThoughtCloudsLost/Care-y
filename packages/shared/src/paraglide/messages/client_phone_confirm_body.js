/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ alias: NonNullable<unknown>, tickets: NonNullable<unknown> }} Client_Phone_Confirm_BodyInputs */

const en_client_phone_confirm_body = /** @type {(inputs: Client_Phone_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This changes the phone for ${i?.alias} across all their ${i?.tickets}.`)
};

const es_client_phone_confirm_body = /** @type {(inputs: Client_Phone_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esto cambia el teléfono de ${i?.alias} en todos sus ${i?.tickets}.`)
};

const en_xa2_client_phone_confirm_body = /** @type {(inputs: Client_Phone_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs chàngès thè phònè fòr  •••••••••${i?.alias} àcròss àll thèìr  ••••••${i?.tickets}. •⟧`)
};

/**
* | output |
* | --- |
* | "This changes the phone for {alias} across all their {tickets}." |
*
* @param {Client_Phone_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_confirm_body = /** @type {((inputs: Client_Phone_Confirm_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Confirm_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_phone_confirm_body(inputs)
	if (locale === "en-XA") return en_xa2_client_phone_confirm_body(inputs)
	return en_client_phone_confirm_body(inputs)
});