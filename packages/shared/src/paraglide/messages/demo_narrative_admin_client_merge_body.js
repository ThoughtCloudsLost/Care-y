/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Client_Merge_BodyInputs */

const en_demo_narrative_admin_client_merge_body = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The same person can end up as two client records, usually after calling from a new number. Administrators resolve this by merging the records from the client detail sheet.
**What a merge does.** The duplicate's tickets move to the surviving record so the case history reads as one client.
**History and undo.** Every merge is recorded in a history the administrator can review, and a merge can be undone, which restores the separated records.
**Locking.** A client record can be locked against merging when the separation is intentional.`)
};

const es_demo_narrative_admin_client_merge_body = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La misma persona puede terminar como dos registros de cliente, normalmente después de llamar desde un número nuevo. Los administradores resuelven esto fusionando los registros desde la hoja de detalle del cliente.
**Qué hace una fusión.** Los tickets del duplicado se mueven al registro superviviente para que el historial del caso se lea como un solo cliente.
**Historial y deshacer.** Cada fusión se registra en un historial que el administrador puede revisar, y una fusión puede deshacerse, lo que restaura los registros separados.
**Bloqueo.** Un registro de cliente puede bloquearse contra fusiones cuando la separación es intencional.`)
};

/**
* | output |
* | --- |
* | "The same person can end up as two client records, usually after calling from a new number. Administrators resolve this by merging the records from the client..." |
*
* @param {Demo_Narrative_Admin_Client_Merge_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_client_merge_body = /** @type {((inputs?: Demo_Narrative_Admin_Client_Merge_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Client_Merge_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_client_merge_body(inputs)
	return es_demo_narrative_admin_client_merge_body(inputs)
});