/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_EditInputs */

const en_client_phone_edit = /** @type {(inputs: Client_Phone_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit phone`)
};

const es_client_phone_edit = /** @type {(inputs: Client_Phone_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar teléfono`)
};

const en_xa2_client_phone_edit = /** @type {(inputs: Client_Phone_EditInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt phònè •••⟧`)
};

/**
* | output |
* | --- |
* | "Edit phone" |
*
* @param {Client_Phone_EditInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_edit = /** @type {((inputs?: Client_Phone_EditInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_EditInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_phone_edit(inputs)
	if (locale === "en-XA") return en_xa2_client_phone_edit(inputs)
	return en_client_phone_edit(inputs)
});