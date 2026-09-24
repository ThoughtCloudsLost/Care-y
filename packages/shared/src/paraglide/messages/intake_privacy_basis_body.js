/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_Basis_BodyInputs */

const en_intake_privacy_basis_body = /** @type {(inputs: Intake_Privacy_Basis_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`We process your information to provide support you requested. Your organization should confirm the specific legal basis with legal counsel.`)
};

const es_intake_privacy_basis_body = /** @type {(inputs: Intake_Privacy_Basis_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Procesamos tu información para brindarte el apoyo que solicitaste. Tu organización debe confirmar la base legal específica con asesoria legal.`)
};

const en_xa2_intake_privacy_basis_body = /** @type {(inputs: Intake_Privacy_Basis_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wè pròcèss yòùr ìnfòrmàtìòn tò pròvìdè sùppòrt yòù rèqùèstèd. Yòùr òrgànìzàtìòn shòùld cònfìrm thè spècìfìc lègàl bàsìs wìth lègàl còùnsèl. ••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "We process your information to provide support you requested. Your organization should confirm the specific legal basis with legal counsel." |
*
* @param {Intake_Privacy_Basis_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_basis_body = /** @type {((inputs?: Intake_Privacy_Basis_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_Basis_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_basis_body(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_basis_body(inputs)
	return en_intake_privacy_basis_body(inputs)
});