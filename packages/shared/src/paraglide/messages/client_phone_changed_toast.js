/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_Changed_ToastInputs */

const en_client_phone_changed_toast = /** @type {(inputs: Client_Phone_Changed_ToastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone number updated`)
};

const es_client_phone_changed_toast = /** @type {(inputs: Client_Phone_Changed_ToastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numero de telefono actualizado`)
};

/**
* | output |
* | --- |
* | "Phone number updated" |
*
* @param {Client_Phone_Changed_ToastInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_changed_toast = /** @type {((inputs?: Client_Phone_Changed_ToastInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Changed_ToastInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_phone_changed_toast(inputs)
	return es_client_phone_changed_toast(inputs)
});