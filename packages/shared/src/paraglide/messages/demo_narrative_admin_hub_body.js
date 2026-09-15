/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_BodyInputs */

const en_demo_narrative_admin_hub_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The hub organizes destinations into four groups, People, Communications, Organization, and Analytics, and each destination shows a live count from the database and links to the relevant management page.
**Status badges.** The hub's live counts double as health signals, switching to a warning style when a count crosses a threshold such as zero connected phone numbers or missing encryption keys.
**Permissions.** Each destination requires a specific permission, and the hub shows only the destinations the user's current permission set includes. Since the permission matrix is configurable, two users with the same role title may see different destinations if their organization has changed the defaults.
**Analytics.** The analytics group is in development.`)
};

const es_demo_narrative_admin_hub_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El centro organiza los destinos en cuatro grupos, Personas, Comunicaciones, Organización y Analíticas, y cada destino muestra un conteo en vivo de la base de datos y enlaza a la página de gestión correspondiente.
**Insignias de estado.** Los conteos en vivo del centro funcionan también como señales de salud, cambiando a estilo de advertencia cuando un conteo cruza un umbral como cero líneas telefónicas conectadas o claves de cifrado faltantes.
**Permisos.** Cada destino requiere un permiso específico, y el centro muestra solo los destinos que el conjunto de permisos de la persona usuaria incluye. Como la matriz de permisos es configurable, dos personas con el mismo título de rol pueden ver destinos diferentes si su organización ha cambiado los valores predeterminados.
**Analíticas.** El grupo de analíticas está en desarrollo.`)
};

/**
* | output |
* | --- |
* | "The hub organizes destinations into four groups, People, Communications, Organization, and Analytics, and each destination shows a live count from the databa..." |
*
* @param {Demo_Narrative_Admin_Hub_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_body(inputs)
	return en_demo_narrative_admin_hub_body(inputs)
});