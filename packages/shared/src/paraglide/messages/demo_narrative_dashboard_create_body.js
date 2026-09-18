/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Create_BodyInputs */

const en_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The plus button in the navigation bar opens a creation menu. Options depend on the current role and permissions. All volunteers can create a new ticket by default. Administrators and managers may also see options for knowledge base articles, categories, queues, or inviting new volunteers.
**Single option shortcut.** When only one creation option is available, the button skips the menu and goes directly to the creation form.`)
};

const es_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El botón de más en la barra de navegación abre un menú de creación. Las opciones dependen del rol y los permisos actuales. Todos los voluntarios pueden crear un ticket nuevo por defecto. Las personas administradoras y gestoras también pueden ver opciones para artículos de la base de conocimiento, categorías, colas o invitar nuevos voluntarios.
**Atajo de opción única.** Cuando solo hay una opción de creación disponible, el botón salta el menú y va directamente al formulario de creación.`)
};

/**
* | output |
* | --- |
* | "The plus button in the navigation bar opens a creation menu. Options depend on the current role and permissions. All volunteers can create a new ticket by de..." |
*
* @param {Demo_Narrative_Dashboard_Create_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_create_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Create_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Create_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_create_body(inputs)
	return en_demo_narrative_dashboard_create_body(inputs)
});