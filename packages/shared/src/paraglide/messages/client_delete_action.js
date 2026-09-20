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

/**
* | output |
* | --- |
* | "Delete {client}" |
*
* @param {Client_Delete_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_delete_action = /** @type {((inputs: Client_Delete_ActionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Delete_ActionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_delete_action(inputs)
	return en_client_delete_action(inputs)
});