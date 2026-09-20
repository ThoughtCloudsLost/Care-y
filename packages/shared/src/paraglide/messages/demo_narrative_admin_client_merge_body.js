/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Client_Merge_BodyInputs */

const en_demo_narrative_admin_client_merge_body = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The same person can end up as two client records, usually after calling from a new number, and the merge tool resolves this from the client detail sheet.
**What a merge does.** The client merge moves the duplicate's tickets to the surviving record so the case history reads as one client.
**History and undo.** Every merge is recorded in a history that can be reviewed later, and a merge can be undone to restore the separated records. Locking a record against merges prevents future consolidation when the separation is intentional.
**Permissions.** The merge tool requires the Merge clients permission, which is separate from the View clients permission needed to see the client list.`)
};

const es_demo_narrative_admin_client_merge_body = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La misma persona puede terminar como dos registros de cliente, normalmente después de llamar desde un número nuevo, y la herramienta de fusión lo resuelve desde la hoja de detalle del cliente.
**Qué hace una fusión.** La fusión de clientes mueve los tickets del duplicado al registro superviviente para que el historial del caso se lea como un solo cliente.
**Historial y deshacer.** Cada fusión se registra en un historial que se puede revisar posteriormente, y una fusión puede deshacerse para restaurar los registros separados. Bloquear un registro contra fusiones evita consolidaciones futuras cuando la separación es intencional.
**Permisos.** La herramienta de fusión requiere el permiso Fusionar clientes, que es independiente del permiso Ver clientes necesario para ver la lista de clientes.`)
};

const en_xa2_demo_narrative_admin_client_merge_body = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sàmè pèrsòn càn ènd ùp às twò clìènt rècòrds, ùsùàlly àftèr càllìng fròm à nèw nùmbèr, ànd thè mèrgè tòòl rèsòlvès thìs fròm thè clìènt dètàìl shèèt.
 •••••••••••••••••••••••••••••••••••••••••••••••**Whàt à mèrgè dòès. ••••••** Thè clìènt mèrgè mòvès thè dùplìcàtè's tìckèts tò thè sùrvìvìng rècòrd sò thè càsè hìstòry rèàds às ònè clìènt.
 ••••••••••••••••••••••••••••••••••**Hìstòry ànd ùndò. ••••••** Èvèry mèrgè ìs rècòrdèd ìn à hìstòry thàt càn bè rèvìèwèd làtèr, ànd à mèrgè càn bè ùndònè tò rèstòrè thè sèpàràtèd rècòrds. Lòckìng à rècòrd àgàìnst mèrgès prèvènts fùtùrè cònsòlìdàtìòn whèn thè sèpàràtìòn ìs ìntèntìònàl.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Thè mèrgè tòòl rèqùìrès thè Mèrgè clìènts pèrmìssìòn, whìch ìs sèpàràtè fròm thè Vìèw clìènts pèrmìssìòn nèèdèd tò sèè thè clìènt lìst. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The same person can end up as two client records, usually after calling from a new number, and the merge tool resolves this from the client detail sheet. **W..." |
*
* @param {Demo_Narrative_Admin_Client_Merge_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_client_merge_body = /** @type {((inputs?: Demo_Narrative_Admin_Client_Merge_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Client_Merge_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_client_merge_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_client_merge_body(inputs)
	return en_demo_narrative_admin_client_merge_body(inputs)
});