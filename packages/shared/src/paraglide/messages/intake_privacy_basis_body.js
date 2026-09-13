/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Basis_BodyInputs */

const en_intake_privacy_basis_body = /** @type {(inputs: Intake_Privacy_Basis_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We process your information to provide support you requested. Your organization should confirm the specific legal basis with legal counsel.`)
};

const es_intake_privacy_basis_body = /** @type {(inputs: Intake_Privacy_Basis_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Procesamos tu informacion para brindarte el apoyo que solicitaste. Tu organizacion debe confirmar la base legal especifica con asesoria legal.`)
};

/**
* | output |
* | --- |
* | "We process your information to provide support you requested. Your organization should confirm the specific legal basis with legal counsel." |
*
* @param {Intake_Privacy_Basis_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_basis_body = /** @type {((inputs?: Intake_Privacy_Basis_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Basis_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_basis_body(inputs)
	return es_intake_privacy_basis_body(inputs)
});