/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_General_BodyInputs */

const en_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization name, country, and default interface language are configured here. These values are stored as plaintext because they appear on pre auth pages and do not contain sensitive content.`)
};

const es_demo_narrative_admin_general_body = /** @type {(inputs: Demo_Narrative_Admin_General_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre de la organización, el país y el idioma predeterminado de la interfaz se configuran aquí. Estos valores se almacenan en texto plano porque aparecen en páginas previas a la autenticación y no contienen contenido sensible.`)
};

/**
* | output |
* | --- |
* | "The organization name, country, and default interface language are configured here. These values are stored as plaintext because they appear on pre auth page..." |
*
* @param {Demo_Narrative_Admin_General_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_general_body = /** @type {((inputs?: Demo_Narrative_Admin_General_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_General_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_general_body(inputs)
	return en_demo_narrative_admin_general_body(inputs)
});