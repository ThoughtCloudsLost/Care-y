/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Panel_BodyInputs */

const en_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case panel holds the contact rows, the client's channel, the notes and media collected on the case, and the actions that change it: editing the case, assigning it, changing its priority or queue, placing a hold, watching it, taking or releasing it, and closing or reopening it. [[#client-data #permissions]]
**What the panel is allowed to show of a client.** The phone number and the email address arrive in one of three forms, decided per request. An account with permission to see client details gets the masked forms, the last four digits and a first letter with the domain. An account with permission to see client identifiers in full gets both values whole. An account with neither, on a case it does not hold, is told the details were withheld rather than shown an empty row. [The permission system](#deep-dive/the-permission-system) covers where those permissions come from. [[#permissions #privacy]]
**Why the server can read a number at all.** Contact values are sealed with the server's operational key rather than the case key, because the server is what places the call and sends the text with nobody watching. A seized database therefore yields client phone numbers and email addresses if the operational key is seized with it, while the case content stays closed. [The trust boundary](#deep-dive/the-trust-boundary) sets out that split, and [The telephony relay](#deep-dive/the-telephony-relay) covers why the relay needs the value. [[#trust-boundary #server-holds #telephony]]
**Editing a number that already belongs to someone.** Saving a phone number or an address that another client record carries opens the merge path instead of creating a second record on the same contact. [Merging clients](#admin-people/client-merge) covers what a merge does to the two records. [[#client-data]]
**What the panel assembles.** \`TicketPanelContent.svelte\` reads the same case query as the header and the thread and takes the notes section, the media section and the tier section as children, so the panel issues no case query of its own. The withheld state travels as its own boolean rather than being inferred from a null value. Recent cases for the same client is in development. [Internal notes](#ticket-detail/notes) covers the notes it lists. [[#client-data #failure-states]]`)
};

const es_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel del caso contiene las filas de contacto, el canal del cliente, las notas y los archivos reunidos en el caso y las acciones que lo cambian: editar el caso, asignarlo, cambiar su prioridad o su cola, ponerlo en espera, seguirlo, tomarlo o soltarlo y cerrarlo o reabrirlo. [[#client-data #permissions]]
**Lo que el panel puede mostrar de un cliente.** El número de teléfono y la dirección de correo llegan en una de tres formas, decidida en cada petición. Una cuenta con permiso para ver datos de clientes recibe las formas enmascaradas, los últimos cuatro dígitos y una primera letra con el dominio. Una cuenta con permiso para ver los identificadores completos recibe ambos valores enteros. Una cuenta sin ninguno de los dos, en un caso que no lleva, recibe la indicación de que los datos se retuvieron y no una fila vacía. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde salen esos permisos. [[#permissions #privacy]]
**Por qué el servidor puede leer un número.** Los valores de contacto se sellan con la clave operativa del servidor y no con la clave del caso, porque el servidor es quien hace la llamada y envía el mensaje sin nadie delante. Una base de datos incautada entrega por tanto los teléfonos y los correos de los clientes si la clave operativa se incauta con ella, mientras el contenido del caso sigue cerrado. [La frontera de confianza](#deep-dive/the-trust-boundary) expone esa división, y [El relé de telefonía](#deep-dive/the-telephony-relay) trata por qué el relé necesita el valor. [[#trust-boundary #server-holds #telephony]]
**Editar un número que ya es de alguien.** Guardar un teléfono o una dirección que ya tiene otro registro de cliente abre el camino de la fusión en lugar de crear un segundo registro sobre el mismo contacto. [Fusionar clientes](#admin-people/client-merge) trata lo que una fusión hace con los dos registros. [[#client-data]]
**Lo que el panel reúne.** \`TicketPanelContent.svelte\` lee la misma consulta del caso que el encabezado y el hilo y toma como hijos la sección de notas, la de archivos y la de nivel, de modo que el panel no lanza ninguna consulta propia del caso. El estado de retenido viaja como un booleano propio en lugar de deducirse de un valor nulo. El historial reciente del mismo cliente está en desarrollo. [Notas internas](#ticket-detail/notes) trata las notas que enumera. [[#client-data #failure-states]]`)
};

const en_xa2_demo_narrative_topic_case_panel_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè càsè pànèl hòlds thè fùll càsè rècòrd ànd èvèry càsè lèvèl àctìòn. Ìt òpèns fròm thè clìènt àlìàs òr thè càsè bùttòn ìn thè nàvìgàtìòn bàr.
 ••••••••••••••••••••••••••••••••••••••••••••**Phònè nùmbèr. ••••** Ìf àn èdìtèd nùmbèr màtchès àn èxìstìng clìènt, à mèrgè shèèt òpèns tò rèsòlvè thè cònflìct.
 •••••••••••••••••••••••••••••**Èncryptìòn. ••••** Èvèry chàngè màdè fròm thè pànèl ìs èncryptèd ìn thè bròwsèr bèfòrè ìt ìs sènt, thè sàmè às èdìts màdè ànywhèrè èlsè ìn thè àpp. •••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The case panel holds the contact rows, the client's channel, the notes and media collected on the case, and the actions that change it: editing the case, ass..." |
*
* @param {Demo_Narrative_Topic_Case_Panel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_panel_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Panel_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Panel_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_case_panel_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_case_panel_body(inputs)
	return en_demo_narrative_topic_case_panel_body(inputs)
});