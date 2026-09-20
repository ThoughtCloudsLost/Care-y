/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Client_Delete_Confirm_TitleInputs */

const en_client_delete_confirm_title = /** @type {(inputs: Client_Delete_Confirm_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Delete ${i?.client}?`)
};

const es_client_delete_confirm_title = /** @type {(inputs: Client_Delete_Confirm_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`¿Eliminar ${i?.client}?`)
};

/**
* | output |
* | --- |
* | "Delete {client}?" |
*
* @param {Client_Delete_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_delete_confirm_title = /** @type {((inputs: Client_Delete_Confirm_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Delete_Confirm_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_delete_confirm_title(inputs)
	return en_client_delete_confirm_title(inputs)
});