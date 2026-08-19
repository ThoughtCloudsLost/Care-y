/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_BodyInputs */

const en_demo_narrative_admin_hub_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The hub organizes destinations into four groups. People, Communications, Organization, and Analytics each show a live count from the database and link to the relevant management page.
**Status badges.** Each destination's count doubles as a health signal. A badge switches to a warning style when something needs attention, such as missing keys or no connected phone numbers.
**Permissions.** The destinations shown depend on the volunteer's role. Administrators see all destinations. Managers see people management, queues, the client list, and analytics, but not organization configuration or infrastructure settings.
**Analytics.** The analytics group is planned but not yet available, so its rows are dimmed and tapping one shows a notice.`)
};

const es_demo_narrative_admin_hub_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El centro organiza los destinos en cuatro grupos. Personas, Comunicaciones, Organización y Analíticas muestran cada uno un conteo en vivo de la base de datos y enlazan a la página de gestión correspondiente.
**Insignias de estado.** El conteo de cada destino funciona también como señal de salud. Una insignia cambia a estilo de advertencia cuando algo necesita atención, como claves faltantes o líneas telefónicas sin conectar.
**Permisos.** Los destinos mostrados dependen del rol del voluntario. Los administradores ven todos los destinos. Los gestores ven la gestión de personas, colas, la lista de clientes y analíticas, pero no la configuración de la organización ni los ajustes de infraestructura.
**Analíticas.** El grupo de analíticas está planificado pero aún no disponible, por lo que sus filas aparecen atenuadas y tocar una muestra un aviso.`)
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