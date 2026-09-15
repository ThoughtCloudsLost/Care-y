/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Audit_Log_BodyInputs */

const en_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The audit tab lists administrative actions across the organization. Each row shows the actor (who performed the action), the event type, a timestamp, and a detail column describing what changed.
**Filters.** Filter pills above the list narrow results by event type, actor, and date range.
**What is logged.** Audit events cover both organizational changes and ticket lifecycle events. A role grant, a queue modification, a key rotation, a ticket creation, a ticket closure, and a content update are all audit events.
**Retention.** Audit entries persist independently of the ticket data retention policy and are not subject to automatic deletion, because they serve as the organization's operational record.`)
};

const es_demo_narrative_admin_audit_log_body = /** @type {(inputs: Demo_Narrative_Admin_Audit_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pestaña de auditoría lista las acciones administrativas en toda la organización. Cada fila muestra el actor (quién realizó la acción), el tipo de evento, una marca de tiempo y una columna de detalle describiendo qué cambió.
**Filtros.** Las pastillas de filtro sobre la lista acotan resultados por tipo de evento, actor y rango de fechas.
**Qué se registra.** Los eventos de auditoría cubren tanto cambios organizativos como eventos del ciclo de vida de los tickets. Un otorgamiento de rol, una modificación de cola, una rotación de claves, la creación de un ticket, el cierre de un ticket y una actualización de contenido son todos eventos de auditoría.
**Retención.** Las entradas de auditoría persisten independientemente de la política de retención de datos de tickets y no están sujetas a eliminación automática, porque sirven como el registro operativo de la organización.`)
};

/**
* | output |
* | --- |
* | "The audit tab lists administrative actions across the organization. Each row shows the actor (who performed the action), the event type, a timestamp, and a d..." |
*
* @param {Demo_Narrative_Admin_Audit_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_audit_log_body = /** @type {((inputs?: Demo_Narrative_Admin_Audit_Log_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Audit_Log_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_audit_log_body(inputs)
	return en_demo_narrative_admin_audit_log_body(inputs)
});