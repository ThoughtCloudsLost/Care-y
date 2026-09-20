/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Client_Delete_ErrorInputs */

const en_client_delete_error = /** @type {(inputs: Client_Delete_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Could not delete ${i?.client}.`)
};

const es_client_delete_error = /** @type {(inputs: Client_Delete_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se pudo eliminar al ${i?.client}.`)
};

const en_xa2_client_delete_error = /** @type {(inputs: Client_Delete_ErrorInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt dèlètè  ••••••${i?.client}. •⟧`)
};

/**
* | output |
* | --- |
* | "Could not delete {client}." |
*
* @param {Client_Delete_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_delete_error = /** @type {((inputs: Client_Delete_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Delete_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_delete_error(inputs)
	if (locale === "en-XA") return en_xa2_client_delete_error(inputs)
	return en_client_delete_error(inputs)
});