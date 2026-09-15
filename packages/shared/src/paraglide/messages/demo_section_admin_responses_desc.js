/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Responses_DescInputs */

const en_demo_section_admin_responses_desc = /** @type {(inputs: Demo_Section_Admin_Responses_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The response viewer shows intake form submissions as decrypted cards, where each card displays the fields the visitor filled in. When the current user does not hold the intake key for a response, that response appears as a locked card explaining why the content is unreadable.`)
};

const es_demo_section_admin_responses_desc = /** @type {(inputs: Demo_Section_Admin_Responses_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El visor de respuestas muestra los envíos de formularios de admisión como tarjetas descifradas, donde cada tarjeta muestra los campos que el visitante completó. Cuando el usuario actual no posee la clave de admisión de una respuesta, esa respuesta aparece como una tarjeta bloqueada que explica por qué el contenido es ilegible.`)
};

/**
* | output |
* | --- |
* | "The response viewer shows intake form submissions as decrypted cards, where each card displays the fields the visitor filled in. When the current user does n..." |
*
* @param {Demo_Section_Admin_Responses_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_responses_desc = /** @type {((inputs?: Demo_Section_Admin_Responses_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Responses_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_responses_desc(inputs)
	return en_demo_section_admin_responses_desc(inputs)
});