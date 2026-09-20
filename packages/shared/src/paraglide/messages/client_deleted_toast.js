/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Client: NonNullable<unknown> }} Client_Deleted_ToastInputs */

const en_client_deleted_toast = /** @type {(inputs: Client_Deleted_ToastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} deleted.`)
};

const es_client_deleted_toast = /** @type {(inputs: Client_Deleted_ToastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Client} eliminado.`)
};

const en_xa2_client_deleted_toast = /** @type {(inputs: Client_Deleted_ToastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Client} dèlètèd. •••⟧`)
};

/**
* | output |
* | --- |
* | "{Client} deleted." |
*
* @param {Client_Deleted_ToastInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_deleted_toast = /** @type {((inputs: Client_Deleted_ToastInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Deleted_ToastInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_deleted_toast(inputs)
	if (locale === "en-XA") return en_xa2_client_deleted_toast(inputs)
	return en_client_deleted_toast(inputs)
});