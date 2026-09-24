/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Phone_Changed_ToastInputs */

const en_client_phone_changed_toast = /** @type {(inputs: Client_Phone_Changed_ToastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone number updated`)
};

const es_client_phone_changed_toast = /** @type {(inputs: Client_Phone_Changed_ToastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Número de teléfono actualizado`)
};

const en_xa2_client_phone_changed_toast = /** @type {(inputs: Client_Phone_Changed_ToastInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè nùmbèr ùpdàtèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone number updated" |
*
* @param {Client_Phone_Changed_ToastInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_changed_toast = /** @type {((inputs?: Client_Phone_Changed_ToastInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Phone_Changed_ToastInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_phone_changed_toast(inputs)
	if (locale === "en-XA") return en_xa2_client_phone_changed_toast(inputs)
	return en_client_phone_changed_toast(inputs)
});