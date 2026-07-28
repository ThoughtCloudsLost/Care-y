/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_DescInputs */

const en_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The admin hub gives managers a bird's-eye view of the organization: active volunteers, queues, phone lines, and communication templates. Every count shown here is a live query against the in-browser database.`)
};

const es_demo_section_admin_desc = /** @type {(inputs: Demo_Section_Admin_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El centro de administracion ofrece a los gerentes una vista general de la organizacion: voluntarios activos, colas, lineas telefonicas y plantillas de comunicacion. Cada conteo mostrado es una consulta en vivo contra la base de datos del navegador.`)
};

/**
* | output |
* | --- |
* | "The admin hub gives managers a bird's-eye view of the organization: active volunteers, queues, phone lines, and communication templates. Every count shown he..." |
*
* @param {Demo_Section_Admin_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_desc = /** @type {((inputs?: Demo_Section_Admin_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_admin_desc(inputs)
	return es_demo_section_admin_desc(inputs)
});