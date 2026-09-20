/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Queues_BodyInputs */

const en_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queues control how tickets are organized and routed.
**Lifecycle.** Deleting a queue prompts for another queue to receive its tickets, so nothing is orphaned, and one queue can be designated as the intake queue that receives tickets from incoming calls.
**Encryption.** Queue names, colors, and icons are encrypted with the organization key before storage, so the server cannot read them and the browser decrypts them locally for display.
**Permissions.** Queue management requires the Manage queues permission. Separately, the Manage queue membership permission controls who can assign users to queues, and adding someone to a queue grants them read access to every case in it.`)
};

const es_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las colas controlan cómo se organizan y enrutan los tickets.
**Ciclo de vida.** Eliminar una cola solicita otra cola para recibir sus tickets, para que nada quede huérfano, y una cola puede designarse como la cola de recepción que recibe tickets de llamadas entrantes.
**Cifrado.** Los nombres, colores e iconos de las colas se cifran con la clave de la organización antes de almacenarse, de modo que el servidor no puede leerlos y el navegador los descifra localmente para mostrarlos.
**Permisos.** La gestión de colas requiere el permiso Gestionar colas. Por separado, el permiso Gestionar membresía de colas controla quién puede asignar personas a colas, y añadir a alguien a una cola le otorga acceso de lectura a todos los casos en ella.`)
};

const en_xa2_demo_narrative_admin_queues_body = /** @type {(inputs: Demo_Narrative_Admin_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Qùèùès còntròl hòw tìckèts àrè òrgànìzèd ànd ròùtèd.
 ••••••••••••••••**Lìfècyclè. •••** Dèlètìng à qùèùè pròmpts fòr ànòthèr qùèùè tò rècèìvè ìts tìckèts, sò nòthìng ìs òrphànèd, ànd ònè qùèùè càn bè dèsìgnàtèd às thè ìntàkè qùèùè thàt rècèìvès tìckèts fròm ìncòmìng càlls.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Qùèùè nàmès, còlòrs, ànd ìcòns àrè èncryptèd wìth thè òrgànìzàtìòn kèy bèfòrè stòràgè, sò thè sèrvèr cànnòt rèàd thèm ànd thè bròwsèr dècrypts thèm lòcàlly fòr dìsplày.
 •••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Qùèùè mànàgèmènt rèqùìrès thè Mànàgè qùèùès pèrmìssìòn. Sèpàràtèly, thè Mànàgè qùèùè mèmbèrshìp pèrmìssìòn còntròls whò càn àssìgn ùsèrs tò qùèùès, ànd àddìng sòmèònè tò à qùèùè grànts thèm rèàd àccèss tò èvèry càsè ìn ìt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Queues control how tickets are organized and routed. **Lifecycle.** Deleting a queue prompts for another queue to receive its tickets, so nothing is orphaned..." |
*
* @param {Demo_Narrative_Admin_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_queues_body = /** @type {((inputs?: Demo_Narrative_Admin_Queues_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Queues_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_queues_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_queues_body(inputs)
	return en_demo_narrative_admin_queues_body(inputs)
});