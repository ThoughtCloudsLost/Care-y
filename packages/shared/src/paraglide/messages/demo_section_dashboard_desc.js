/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Dashboard_DescInputs */

const en_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The dashboard is the home screen after login. It shows the volunteer's current shift, ticket counts per queue, recent activity, and quick access to knowledge base articles. All sections pull live data from the encrypted database. Sections are collapsible so volunteers can focus on what they need, and a row of section buttons under the title jumps to any section and expands it if it was collapsed.`)
};

const es_demo_section_dashboard_desc = /** @type {(inputs: Demo_Section_Dashboard_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel principal es la pantalla de inicio después de iniciar sesión. Muestra el turno actual del voluntario, conteos de tickets por cola, actividad reciente y acceso rápido a artículos de la base de conocimiento. Todas las secciones obtienen datos en tiempo real de la base de datos cifrada. Las secciones son plegables para que los voluntarios puedan concentrarse en lo que necesitan, y una fila de botones de sección debajo del título salta a cualquier sección y la expande si estaba colapsada.`)
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