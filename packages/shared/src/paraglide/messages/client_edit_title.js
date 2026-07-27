/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown> }} Client_Edit_TitleInputs */

const en_client_edit_title = /** @type {(inputs: Client_Edit_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Edit ${i?.Client}`)
};

const es_client_edit_title = /** @type {(inputs: Client_Edit_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Editar ${i?.Client}`)
};

/**
* | output |
* | --- |
* | "Edit {Client}" |
*
* @param {Client_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_edit_title = /** @type {((inputs: Client_Edit_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Edit_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_edit_title(inputs)
	return es_client_edit_title(inputs)
});