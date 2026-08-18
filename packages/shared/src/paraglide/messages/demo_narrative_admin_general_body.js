/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_General_BodyInputs */

const en_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Basic organization settings like the organization name and contact information. These fields are encrypted with the organization key before storage.`)
};

const es_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ajustes basicos de la organizacion como el nombre y la informacion de contacto. Estos campos se cifran con la clave de la organizacion antes de almacenarse.`)
};

/**
* | output |
* | --- |
* | "Basic organization settings like the organization name and contact information. These fields are encrypted with the organization key before storage." |
*
* @param {Demo_Narrative_Admin_General_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_general_body = /** @type {((inputs?: Demo_Narrative_Admin_General_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_General_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_general_body(inputs)
	return es_demo_narrative_admin_general_body(inputs)
});