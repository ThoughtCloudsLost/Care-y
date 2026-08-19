/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_General_BodyInputs */

const en_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization name, country, and default interface language are configured here, and each is encrypted with the organization key before storage.`)
};

const es_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre de la organizacion, el pais y el idioma predeterminado de la interfaz se configuran aqui, y cada uno se cifra con la clave de la organizacion antes de almacenarse.`)
};

/**
* | output |
* | --- |
* | "The organization name, country, and default interface language are configured here, and each is encrypted with the organization key before storage." |
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