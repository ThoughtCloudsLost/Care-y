/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Server_WhyInputs */

const en_intake_protected_server_why = /** @type {(inputs: Intake_Protected_Server_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If someone gains access to this server, they see only encrypted text. Decrypting it requires a volunteer's password plus verification from two separate servers in different countries. No single server holds enough to read your information.`)
};

const es_intake_protected_server_why = /** @type {(inputs: Intake_Protected_Server_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si alguien accede a este servidor, solo ve texto cifrado. Descifrarlo requiere la contrasena de un voluntario y la verificacion de dos servidores separados en paises diferentes. Ningun servidor tiene suficiente informacion por si solo para leer tus datos.`)
};

/**
* | output |
* | --- |
* | "If someone gains access to this server, they see only encrypted text. Decrypting it requires a volunteer's password plus verification from two separate serve..." |
*
* @param {Intake_Protected_Server_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_server_why = /** @type {((inputs?: Intake_Protected_Server_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Server_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_protected_server_why(inputs)
	return es_intake_protected_server_why(inputs)
});