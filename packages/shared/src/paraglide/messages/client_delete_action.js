/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Client_Delete_ActionInputs */

const en_client_delete_action = /** @type {(inputs: Client_Delete_ActionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Delete ${i?.client}`)
};

const es_client_delete_action = /** @type {(inputs: Client_Delete_ActionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Eliminar ${i?.client}`)
};

const en_xa2_client_delete_action = /** @type {(inputs: Client_Delete_ActionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè  •••${i?.client}⟧`)
};

/**
* | output |
* | --- |
* | "Delete {client}" |
*
* @param {Client_Delete_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_delete_action = /** @type {((inputs: Client_Delete_ActionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Delete_ActionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_delete_action(inputs)
	if (locale === "en-XA") return en_xa2_client_delete_action(inputs)
	return en_client_delete_action(inputs)
});