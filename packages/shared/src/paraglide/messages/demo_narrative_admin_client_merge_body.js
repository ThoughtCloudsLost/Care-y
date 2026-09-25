/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Client_Merge_BodyInputs */

const en_demo_narrative_admin_client_merge_body = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A merge names one of two records the survivor and marks the other as merged into it, which is a pointer between rows rather than a rewrite of either. [[#client-data]]
**What the merge changes.** The record merged away drops out of the client list, its open case is closed with a system note recording why, and its portal channel is reconciled against the survivor's so that one channel is kept and the other revoked. Its cases keep pointing at it, so the survivor's case count does not absorb them and the two histories stay legible as two. A case with unresolved dependencies stops the merge rather than closing underneath them. [[#client-data #portal]]
**What undo restores and what it does not.** The browser seals a snapshot of the record being merged away under the organization key before the request leaves, and undo clears the pointer and marks the merge event undone. The case that was closed stays closed and the channel that was revoked stays revoked, so undo restores two separate records rather than the state before the merge. A merge can be locked against undo once its result is settled. [[#encryption #failure-states]]
**What the server records in the open.** A merge event row carries both record ids, the time, whether it has been undone and whether it is locked, all plaintext, with the snapshot beside them as ciphertext. The audit log gains a row for the merge, for an undo and for a lock change, each carrying ids and no names. [Audit log](#admin-logs/audit) covers what an audit row holds. [[#server-holds #metadata]]
**One permission for three actions.** Merging, undoing and locking all run on Merge clients, which is separate from View clients, so an account can read the list without being able to consolidate it. [Merge candidates](#dashboard/merge-candidates) covers the scan that proposes pairs. [[#permissions]]`)
};

const es_demo_narrative_admin_client_merge_body = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una fusión nombra superviviente a uno de dos registros y marca el otro como fusionado en él, lo que es un puntero entre filas y no una reescritura de ninguno de los dos. [[#client-data]]
**Qué cambia la fusión.** El registro fusionado sale de la lista de clientes, su caso abierto se cierra con una nota del sistema que deja constancia del motivo, y su canal del portal se concilia con el del superviviente de modo que se conserva un canal y se revoca el otro. Sus casos siguen apuntando a él, así que el recuento de casos del superviviente no los absorbe y los dos historiales siguen legibles como dos. Un caso con dependencias sin resolver detiene la fusión en lugar de cerrarse por debajo de ellas. [[#client-data #portal]]
**Qué restaura deshacer y qué no.** El navegador sella con la clave de la organización una instantánea del registro que se va a fusionar antes de que salga la petición, y deshacer borra el puntero y marca el evento de fusión como deshecho. El caso que se cerró sigue cerrado y el canal que se revocó sigue revocado, así que deshacer restaura dos registros separados y no el estado anterior a la fusión. Una fusión puede bloquearse contra deshacer cuando su resultado ya está asentado. [[#encryption #failure-states]]
**Lo que el servidor registra a la vista.** Una fila de evento de fusión guarda los identificadores de ambos registros, la hora, si se ha deshecho y si está bloqueada, todo en texto plano, y la instantánea como texto cifrado en esa misma fila. El registro de auditoría suma una fila por la fusión, otra por deshacerla y otra por un cambio de bloqueo, cada una con identificadores y ningún nombre. [Registro de auditoría](#admin-logs/audit) trata lo que guarda una fila de auditoría. [[#server-holds #metadata]]
**Un permiso para tres acciones.** Fusionar, deshacer y bloquear dependen de Fusionar clientes, que es distinto de Ver clientes, así que una cuenta puede leer la lista sin poder consolidarla. [Candidatos para fusión](#dashboard/merge-candidates) trata el rastreo que propone parejas. [[#permissions]]`)
};

const en_xa2_demo_narrative_admin_client_merge_body = /** @type {(inputs: Demo_Narrative_Admin_Client_Merge_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À mèrgè nàmès ònè òf twò rècòrds thè sùrvìvòr ànd màrks thè òthèr às mèrgèd ìntò ìt, whìch ìs à pòìntèr bètwèèn ròws ràthèr thàn à rèwrìtè òf èìthèr. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè mèrgè chàngès. •••••••** Thè rècòrd mèrgèd àwày dròps òùt òf thè clìènt lìst, ìts òpèn càsè ìs clòsèd wìth à systèm nòtè rècòrdìng why, ànd ìts pòrtàl chànnèl ìs rècòncìlèd àgàìnst thè sùrvìvòr's sò thàt ònè chànnèl ìs kèpt ànd thè òthèr rèvòkèd. Ìts càsès kèèp pòìntìng àt ìt, sò thè sùrvìvòr's càsè còùnt dòès nòt àbsòrb thèm ànd thè twò hìstòrìès stày lègìblè às twò. À càsè wìth ùnrèsòlvèd dèpèndèncìès stòps thè mèrgè ràthèr thàn clòsìng ùndèrnèàth thèm. [[#clìènt-dàtà #pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt ùndò rèstòrès ànd whàt ìt dòès nòt. ••••••••••••** Thè bròwsèr sèàls à snàpshòt òf thè rècòrd bèìng mèrgèd àwày ùndèr thè òrgànìzàtìòn kèy bèfòrè thè rèqùèst lèàvès, ànd ùndò clèàrs thè pòìntèr ànd màrks thè mèrgè èvènt ùndònè. Thè càsè thàt wàs clòsèd stàys clòsèd ànd thè chànnèl thàt wàs rèvòkèd stàys rèvòkèd, sò ùndò rèstòrès twò sèpàràtè rècòrds ràthèr thàn thè stàtè bèfòrè thè mèrgè. À mèrgè càn bè lòckèd àgàìnst ùndò òncè ìts rèsùlt ìs sèttlèd. [[#èncryptìòn #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr rècòrds ìn thè òpèn. •••••••••••** À mèrgè èvènt ròw càrrìès bòth rècòrd ìds, thè tìmè, whèthèr ìt hàs bèèn ùndònè ànd whèthèr ìt ìs lòckèd, àll plàìntèxt, wìth thè snàpshòt bèsìdè thèm às cìphèrtèxt. Thè àùdìt lòg gàìns à ròw fòr thè mèrgè, fòr àn ùndò ànd fòr à lòck chàngè, èàch càrryìng ìds ànd nò nàmès. [Àùdìt lòg](#àdmìn-lògs/àùdìt) còvèrs whàt àn àùdìt ròw hòlds. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ònè pèrmìssìòn fòr thrèè àctìòns. ••••••••••** Mèrgìng, ùndòìng ànd lòckìng àll rùn òn Mèrgè clìènts, whìch ìs sèpàràtè fròm Vìèw clìènts, sò àn àccòùnt càn rèàd thè lìst wìthòùt bèìng àblè tò cònsòlìdàtè ìt. [Mèrgè càndìdàtès](#dàshbòàrd/mèrgè-càndìdàtès) còvèrs thè scàn thàt pròpòsès pàìrs. [[#pèrmìssìòns]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A merge names one of two records the survivor and marks the other as merged into it, which is a pointer between rows rather than a rewrite of either. [[#clie..." |
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