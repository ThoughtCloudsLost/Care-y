/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Create_BodyInputs */

const en_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The plus button in the navigation bar opens a menu for creating new items. The options shown depend on the volunteer's role and permissions.
**All volunteers** can create a new ticket by default.
**Administrators and managers** may also see options to create knowledge base articles, categories, queues, or invite new volunteers, depending on their specific permissions.
**Single option shortcut.** If the volunteer only has permission to create one type of item, tapping the button skips the menu and goes directly to the creation form.`)
};

const es_demo_narrative_dashboard_create_body = /** @type {(inputs: Demo_Narrative_Dashboard_Create_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El botón de más en la barra de navegación abre un menú para crear nuevos elementos. Las opciones mostradas dependen del rol y los permisos del voluntario.
**Todos los voluntarios** pueden crear un nuevo ticket por defecto.
**Administradores y gestores** también pueden ver opciones para crear artículos de la base de conocimiento, categorías, colas o invitar nuevos voluntarios, dependiendo de sus permisos específicos.
**Atajo de opción única.** Si el voluntario solo tiene permiso para crear un tipo de elemento, tocar el botón salta el menú y va directamente al formulario de creación.`)
};

/**
* | output |
* | --- |
* | "The plus button in the navigation bar opens a menu for creating new items. The options shown depend on the volunteer's role and permissions. **All volunteers..." |
*
* @param {Demo_Narrative_Dashboard_Create_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_create_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Create_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Create_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_create_body(inputs)
	return es_demo_narrative_dashboard_create_body(inputs)
});