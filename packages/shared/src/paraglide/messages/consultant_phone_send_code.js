/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Send_CodeInputs */

const en_consultant_phone_send_code = /** @type {(inputs: Consultant_Phone_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send code`)
};

const es_consultant_phone_send_code = /** @type {(inputs: Consultant_Phone_Send_CodeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar codigo`)
};

/**
* | output |
* | --- |
* | "Send code" |
*
* @param {Consultant_Phone_Send_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_send_code = /** @type {((inputs?: Consultant_Phone_Send_CodeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Send_CodeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_send_code(inputs)
	return es_consultant_phone_send_code(inputs)
});