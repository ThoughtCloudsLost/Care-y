/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Getting_Started_BodyInputs */

const en_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrators see a setup checklist at the top of the dashboard until the organization is fully configured. Each row is a setup task that links directly to the admin page where it is completed.
**Dismissal.** The card can be collapsed while working through it, and dismissed entirely once setup is done. Dismissal is recorded per organization, so it stays gone for every administrator.
**Visibility.** Volunteers and managers never see this card because it requires the administrator role, which is why switching the demo to a different role hides it.`)
};

const es_demo_narrative_dashboard_getting_started_body = /** @type {(inputs: Demo_Narrative_Dashboard_Getting_Started_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los administradores ven una lista de configuración en la parte superior del panel principal hasta que la organización esté completamente configurada. Cada fila es una tarea de configuración que enlaza directamente a la página de administración donde se completa.
**Descarte.** La tarjeta puede colapsarse mientras se trabaja en ella, y descartarse por completo una vez terminada la configuración. El descarte se registra por organización, por lo que permanece oculta para todos los administradores.
**Visibilidad.** Los voluntarios y gestores nunca ven esta tarjeta porque requiere el rol de administrador, por lo que cambiar el demo a un rol diferente la oculta.`)
};

/**
* | output |
* | --- |
* | "Administrators see a setup checklist at the top of the dashboard until the organization is fully configured. Each row is a setup task that links directly to ..." |
*
* @param {Demo_Narrative_Dashboard_Getting_Started_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_getting_started_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Getting_Started_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Getting_Started_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_getting_started_body(inputs)
	return es_demo_narrative_dashboard_getting_started_body(inputs)
});