/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Analytics_BodyInputs */

const en_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The analytics group holds five destinations, the call log, the audit log and three reporting dashboards that are in development. [[#permissions #metadata]]
**Two permissions, not one.** The three dashboards and the call log run on View reports, while the audit log carries its own permission, so an organization can grant reporting without granting the record of who did what. [Audit log](#admin-logs/audit) covers what a row in that record holds. [[#permissions]]
**What in development means here.** A dashboard destination raises a notice instead of opening, while the call log and the audit log are built and their pages enforce the same permissions the group does. [Call history](#admin-logs/calls) covers what a call leaves behind. [[#failure-states]]`)
};

const es_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo de analíticas tiene cinco destinos, el registro de llamadas, el registro de auditoría y tres paneles de informes que están en desarrollo. [[#permissions #metadata]]
**Dos permisos, no uno.** Los tres paneles y el registro de llamadas dependen de Ver reportes, mientras que el registro de auditoría tiene su propio permiso, así que una organización puede conceder los informes sin conceder la constancia de quién hizo qué. [Registro de auditoría](#admin-logs/audit) trata lo que guarda una fila de esa constancia. [[#permissions]]
**Qué significa aquí en desarrollo.** Un destino de panel muestra un aviso en lugar de abrirse, mientras que el registro de llamadas y el de auditoría están construidos y sus páginas exigen los mismos permisos que el grupo. [Historial de llamadas](#admin-logs/calls) trata qué deja una llamada. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_hub_analytics_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Analytics_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìmpàct rèpòrts, òpèràtìònàl mètrìcs, dèèp ànàlysìs, thè càll lòg, ànd thè àùdìt lòg. Thè ànàlytìcs gròùp ìs ìn dèvèlòpmènt. •••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The analytics group holds five destinations, the call log, the audit log and three reporting dashboards that are in development. [[#permissions #metadata]] *..." |
*
* @param {Demo_Narrative_Admin_Hub_Analytics_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_analytics_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_Analytics_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_Analytics_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_analytics_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_analytics_body(inputs)
	return en_demo_narrative_admin_hub_analytics_body(inputs)
});