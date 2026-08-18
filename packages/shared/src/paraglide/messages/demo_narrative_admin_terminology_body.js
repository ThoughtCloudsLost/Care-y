/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Terminology_BodyInputs */

const en_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organizations can rename standard terms to match their own language. For example, an organization might call tickets "cases" or volunteers "advocates." Terminology is encrypted with the organization key before storage and applied throughout the interface.`)
};

const es_demo_narrative_admin_terminology_body = /** @type {(inputs: Demo_Narrative_Admin_Terminology_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las organizaciones pueden renombrar terminos estandar para coincidir con su propio lenguaje. Por ejemplo, una organizacion podria llamar a los tickets "casos" o a los voluntarios "defensores". La terminologia se cifra con la clave de la organizacion antes de almacenarse y se aplica en toda la interfaz.`)
};

/**
* | output |
* | --- |
* | "Organizations can rename standard terms to match their own language. For example, an organization might call tickets \"cases\" or volunteers \"advocates.\" Termi..." |
*
* @param {Demo_Narrative_Admin_Terminology_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_terminology_body = /** @type {((inputs?: Demo_Narrative_Admin_Terminology_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Terminology_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_terminology_body(inputs)
	return es_demo_narrative_admin_terminology_body(inputs)
});