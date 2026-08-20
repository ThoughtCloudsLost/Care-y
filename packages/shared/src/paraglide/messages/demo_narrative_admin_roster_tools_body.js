/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Roster_Tools_BodyInputs */

const en_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The users tab has the same working tools as the ticket list.
**Filters.** Pills narrow the roster by role, status, key state, and queue membership.
**Sort.** The roster sorts by name, role, or status.
**Search.** The magnifier opens an in page search that steps through matching volunteers.
**Batch actions.** Select mode lets an administrator pick multiple volunteers and deactivate them in one action, behind a confirmation, and deactivation is reversible.`)
};

const es_demo_narrative_admin_roster_tools_body = /** @type {(inputs: Demo_Narrative_Admin_Roster_Tools_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pestaña de usuarios tiene las mismas herramientas de trabajo que la lista de tickets.
**Filtros.** Pastillas reducen el directorio por rol, estado, estado de clave y pertenencia a colas.
**Ordenar.** El directorio se ordena por nombre, rol o estado.
**Buscar.** La lupa abre una búsqueda en la página que recorre los voluntarios coincidentes.
**Acciones masivas.** El modo de selección permite a un administrador elegir varios voluntarios y desactivarlos en una sola acción, con confirmación previa, y la desactivación es reversible.`)
};

/**
* | output |
* | --- |
* | "The users tab has the same working tools as the ticket list. **Filters.** Pills narrow the roster by role, status, key state, and queue membership. **Sort.**..." |
*
* @param {Demo_Narrative_Admin_Roster_Tools_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_roster_tools_body = /** @type {((inputs?: Demo_Narrative_Admin_Roster_Tools_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Roster_Tools_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_roster_tools_body(inputs)
	return es_demo_narrative_admin_roster_tools_body(inputs)
});