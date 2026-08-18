/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Dashboard_DescInputs */

const en_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The dashboard is the home screen after login. It shows the volunteer's current shift, ticket counts per queue, recent activity, and quick access to knowledge base articles. All sections pull live data from the encrypted database. Sections are collapsible so volunteers can focus on what they need.`)
};

const es_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel principal es la pantalla de inicio despues de iniciar sesion. Muestra el turno actual del voluntario, conteos de tickets por cola, actividad reciente y acceso rapido a articulos de la base de conocimiento. Todas las secciones obtienen datos en tiempo real de la base de datos cifrada. Las secciones son plegables para que los voluntarios puedan concentrarse en lo que necesitan.`)
};

/**
* | output |
* | --- |
* | "The dashboard is the home screen after login. It shows the volunteer's current shift, ticket counts per queue, recent activity, and quick access to knowledge..." |
*
* @param {Demo_Section_Dashboard_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_dashboard_desc = /** @type {((inputs?: Demo_Section_Dashboard_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Dashboard_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_section_dashboard_desc(inputs)
	return es_demo_section_dashboard_desc(inputs)
});