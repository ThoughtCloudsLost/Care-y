/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Call_Log_BodyInputs */

const en_demo_narrative_admin_call_log_body = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The calls tab shows a chronological list of phone calls and voicemail entries across the organization. Each row shows the call direction, the client alias decrypted with the organization key, the call duration, the status (completed, no answer, busy, failed, or canceled), and a link to the ticket the call belongs to.
**Filters.** Filter pills above the list narrow results by direction, call status, and date range. Multiple filters can be active at once.
**Data source.** Call entries come from telephony follow-ups stored on tickets. The server reads plaintext metadata columns (timestamps, duration, status) and returns them without accessing any encrypted content.`)
};

const es_demo_narrative_admin_call_log_body = /** @type {(inputs: Demo_Narrative_Admin_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pestaña de llamadas muestra una lista cronológica de llamadas telefónicas y entradas de correo de voz en toda la organización. Cada fila muestra la dirección de la llamada, el alias del cliente descifrado con la clave de la organización, la duración, el estado (completada, sin respuesta, ocupado, fallida o cancelada) y un enlace al ticket al que pertenece la llamada.
**Filtros.** Las pastillas de filtro sobre la lista acotan resultados por dirección, estado de llamada y rango de fechas. Se pueden activar múltiples filtros a la vez.
**Fuente de datos.** Las entradas de llamadas provienen de los seguimientos de telefonía almacenados en los tickets. El servidor lee columnas de metadatos en texto plano (marcas de tiempo, duración, estado) y los devuelve sin acceder a ningún contenido cifrado.`)
};

/**
* | output |
* | --- |
* | "The calls tab shows a chronological list of phone calls and voicemail entries across the organization. Each row shows the call direction, the client alias de..." |
*
* @param {Demo_Narrative_Admin_Call_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_call_log_body = /** @type {((inputs?: Demo_Narrative_Admin_Call_Log_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Call_Log_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_call_log_body(inputs)
	return en_demo_narrative_admin_call_log_body(inputs)
});