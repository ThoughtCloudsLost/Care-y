/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_BodyInputs */

const en_demo_narrative_admin_hub_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The hub organizes destinations into four groups. People, Communications, Organization, and Analytics each show a live count from the database and link to the relevant management page.
**Permissions.** The destinations shown depend on the volunteer's role. Administrators see all destinations. Managers see people and queue management but not organization configuration or infrastructure settings.
**Analytics.** The analytics group is planned but not yet available.`)
};

const es_demo_narrative_admin_hub_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El centro organiza los destinos en cuatro grupos. Personas, Comunicaciones, Organizacion y Analiticas muestran cada uno un conteo en vivo de la base de datos y enlazan a la pagina de gestion correspondiente.
**Permisos.** Los destinos mostrados dependen del rol del voluntario. Los administradores ven todos los destinos. Los gestores ven la gestion de personas y colas, pero no la configuracion de la organizacion ni los ajustes de infraestructura.
**Analiticas.** El grupo de analiticas esta planificado pero aun no disponible.`)
};

/**
* | output |
* | --- |
* | "The hub organizes destinations into four groups. People, Communications, Organization, and Analytics each show a live count from the database and link to the..." |
*
* @param {Demo_Narrative_Admin_Hub_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_hub_body(inputs)
	return es_demo_narrative_admin_hub_body(inputs)
});