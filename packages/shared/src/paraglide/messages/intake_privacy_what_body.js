/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_What_BodyInputs */

const en_intake_privacy_what_body = /** @type {(inputs: Intake_Privacy_What_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We collect the information you provide on this form (your name if given, contact details, and your message) to connect you with a volunteer who can help. All information is encrypted before it leaves your device.`)
};

const es_intake_privacy_what_body = /** @type {(inputs: Intake_Privacy_What_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recopilamos la informacion que proporcionas en este formulario (tu nombre si lo das, datos de contacto y tu mensaje) para conectarte con un voluntario que pueda ayudarte. Toda la informacion se cifra antes de salir de tu dispositivo.`)
};

/**
* | output |
* | --- |
* | "We collect the information you provide on this form (your name if given, contact details, and your message) to connect you with a volunteer who can help. All..." |
*
* @param {Intake_Privacy_What_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_what_body = /** @type {((inputs?: Intake_Privacy_What_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_What_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_what_body(inputs)
	return es_intake_privacy_what_body(inputs)
});