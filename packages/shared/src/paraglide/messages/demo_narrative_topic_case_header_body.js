/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Header_BodyInputs */

const en_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The header at the top of the ticket shows the title, current status, priority, assigned volunteer, and queue.
**Encryption by field.** Title and description are encrypted with the per ticket key. Queue name and assignee display name are encrypted with the organization key. Priority, status, and timestamps are plaintext metadata the server uses for sorting and filtering.
**Client phone.** The client phone number is role masked by the server. Administrators see the full number, managers and the assigned volunteer see the last four digits, and unassigned volunteers see nothing.
**Editing.** Status, priority, assignee, and queue are changed from the case panel, opened from the client alias or the case button in the navigation bar, and the panel also provides hold, assign, close, and reopen actions. Changes are encrypted in the browser before being sent to the server.`)
};

const es_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El encabezado en la parte superior del ticket muestra el título, estado actual, prioridad, voluntario asignado y cola.
**Cifrado por campo.** El título y la descripción están cifrados con la clave por ticket. El nombre de la cola y el nombre del asignado están cifrados con la clave de la organización. La prioridad, el estado y las marcas de tiempo son metadatos en texto plano que el servidor usa para ordenar y filtrar.
**Teléfono del cliente.** El número de teléfono del cliente es enmascarado por el servidor según el rol. Los administradores ven el número completo, los gestores y el voluntario asignado ven los últimos cuatro dígitos, y los voluntarios no asignados no ven nada.
**Edición.** El estado, la prioridad, el asignado y la cola se cambian desde el panel del caso, que se abre desde el alias del cliente o el botón de caso en la barra de navegación, y el panel también ofrece acciones de retener, asignar, cerrar y reabrir. Los cambios se cifran en el navegador antes de enviarse al servidor.`)
};

const en_xa2_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè hèàdèr àt thè tòp òf thè tìckèt shòws thè tìtlè, cùrrènt stàtùs, prìòrìty, àssìgnèd vòlùntèèr, ànd qùèùè.
 •••••••••••••••••••••••••••••••••**Èncryptìòn by fìèld. ••••••** Tìtlè ànd dèscrìptìòn àrè èncryptèd wìth thè pèr tìckèt kèy. Qùèùè nàmè ànd àssìgnèè dìsplày nàmè àrè èncryptèd wìth thè òrgànìzàtìòn kèy. Prìòrìty, stàtùs, ànd tìmèstàmps àrè plàìntèxt mètàdàtà thè sèrvèr ùsès fòr sòrtìng ànd fìltèrìng.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Clìènt phònè. ••••** Thè clìènt phònè nùmbèr ìs ròlè màskèd by thè sèrvèr. Àdmìnìstràtòrs sèè thè fùll nùmbèr, mànàgèrs ànd thè àssìgnèd vòlùntèèr sèè thè làst fòùr dìgìts, ànd ùnàssìgnèd vòlùntèèrs sèè nòthìng.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èdìtìng. •••** Stàtùs, prìòrìty, àssìgnèè, ànd qùèùè àrè chàngèd fròm thè càsè pànèl, òpènèd fròm thè clìènt àlìàs òr thè càsè bùttòn ìn thè nàvìgàtìòn bàr, ànd thè pànèl àlsò pròvìdès hòld, àssìgn, clòsè, ànd rèòpèn àctìòns. Chàngès àrè èncryptèd ìn thè bròwsèr bèfòrè bèìng sènt tò thè sèrvèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The header at the top of the ticket shows the title, current status, priority, assigned volunteer, and queue. **Encryption by field.** Title and description ..." |
*
* @param {Demo_Narrative_Topic_Case_Header_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_header_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Header_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Header_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_case_header_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_case_header_body(inputs)
	return en_demo_narrative_topic_case_header_body(inputs)
});