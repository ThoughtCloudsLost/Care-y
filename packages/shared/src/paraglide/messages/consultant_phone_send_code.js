/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Send_CodeInputs */

const en_consultant_phone_send_code = /** @type {(inputs: Consultant_Phone_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send code`)
};

const es_consultant_phone_send_code = /** @type {(inputs: Consultant_Phone_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar código`)
};

const en_xa2_consultant_phone_send_code = /** @type {(inputs: Consultant_Phone_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd còdè •••⟧`)
};

/**
* | output |
* | --- |
* | "Send code" |
*
* @param {Consultant_Phone_Send_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_send_code = /** @type {((inputs?: Consultant_Phone_Send_CodeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Send_CodeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_send_code(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_send_code(inputs)
	return en_consultant_phone_send_code(inputs)
});