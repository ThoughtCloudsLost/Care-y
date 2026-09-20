/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Error_Client_MergedInputs */

const en_error_client_merged = /** @type {(inputs: Error_Client_MergedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This ${i?.client} has been merged into another ${i?.client}.`)
};

const es_error_client_merged = /** @type {(inputs: Error_Client_MergedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Este ${i?.client} ha sido fusionado con otro ${i?.client}.`)
};

const en_xa2_error_client_merged = /** @type {(inputs: Error_Client_MergedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs  ••${i?.client} hàs bèèn mèrgèd ìntò ànòthèr  •••••••••${i?.client}. •⟧`)
};

/**
* | output |
* | --- |
* | "This {client} has been merged into another {client}." |
*
* @param {Error_Client_MergedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_client_merged = /** @type {((inputs: Error_Client_MergedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Client_MergedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_client_merged(inputs)
	if (locale === "en-XA") return en_xa2_error_client_merged(inputs)
	return en_error_client_merged(inputs)
});