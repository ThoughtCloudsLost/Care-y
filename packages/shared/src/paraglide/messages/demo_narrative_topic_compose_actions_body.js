/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Compose_Actions_BodyInputs */

const en_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The compose menu offers the ways of adding something to a case: a reply on the client's encrypted channel, a text, an email, a file, a saved response, or an internal note. [[#client-data]]
**Which offers appear.** A reply is offered when the client has a portal channel and the organization has secure links switched on, a text when there is a phone number on file and the SMS channel is on, and an email when there is an address on file and the email channel is on. Files, saved responses and notes are always offered. An offer that is absent is a convenience: every send is checked again on the server against the permission for that channel, so hiding an option is not what stops a request. [Channel policy](#admin-comms/channel-policy) covers the switches, and [The permission system](#deep-dive/the-permission-system) covers the grants. [[#permissions #portal #telephony]]
**What each choice costs in exposure.** A reply stays sealed for the client's own browser, a text is handed to a phone company in a form it can act on, and an email is readable by every mail server between here and the recipient. Choosing a text or a call says so once per session. [A reply](#ticket-detail/reply) covers what each channel seals, and [Exposure notices](#ticket-detail/exposure-hints) covers when the notice is raised. [[#encryption #telephony #privacy]]
**Saved responses.** A saved response is organization text, sealed with the organization key and opened in the browser, that is placed into the draft for the user to edit before anything is sent. A response can belong to one queue or to the whole organization. [[#encryption #client-data]]
**What the file picker will accept.** The picker offers the same content types the upload accepts, so a file the server would refuse is not encrypted and uploaded first. [Attachments](#ticket-detail/files) covers the caps and the envelope. [[#failure-states]]
**The menu and its sheets.** \`ComposeActions.svelte\` renders the menu and hosts the saved-response and note sheets, and the callers decide which offers to pass it: \`TicketDetailOrchestrator.svelte\` for the case, \`ReplySheet.svelte\` for the quick reply from a list. Saved responses come from \`030_create_preset_replies.ts\` through \`packages/server/src/tickets/preset-service.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El menú de redacción ofrece las formas de añadir algo a un caso: una respuesta por el canal cifrado del cliente, un mensaje de texto, un correo, un archivo, una respuesta guardada o una nota interna. [[#client-data]]
**Qué ofertas aparecen.** La respuesta se ofrece cuando el cliente tiene un canal de portal y la organización tiene activados los enlaces seguros; el mensaje de texto, cuando hay un número de teléfono registrado y el canal de SMS está activo; y el correo, cuando hay una dirección registrada y el canal de correo está activo. Los archivos, las respuestas guardadas y las notas se ofrecen siempre. Una oferta ausente es una comodidad: cada envío se vuelve a comprobar en el servidor contra el permiso de ese canal, así que ocultar una opción no es lo que detiene una petición. [Política de canales](#admin-comms/channel-policy) trata esos ajustes, y [El sistema de permisos](#deep-dive/the-permission-system) trata las concesiones. [[#permissions #portal #telephony]]
**Lo que cuesta cada opción en exposición.** Una respuesta sigue sellada para el navegador del propio cliente, un mensaje de texto se entrega a una compañía telefónica en una forma con la que pueda operar, y un correo lo pueden leer todos los servidores de correo entre aquí y quien lo recibe. Elegir un mensaje de texto o una llamada lo indica una vez por sesión. [Una respuesta](#ticket-detail/reply) trata lo que sella cada canal, y [Avisos de exposición](#ticket-detail/exposure-hints) trata cuándo se levanta el aviso. [[#encryption #telephony #privacy]]
**Respuestas guardadas.** Una respuesta guardada es texto de la organización, sellado con la clave de la organización y abierto en el navegador, que se coloca en el borrador para que la persona usuaria lo edite antes de enviar nada. Una respuesta puede pertenecer a una cola o a toda la organización. [[#encryption #client-data]]
**Lo que aceptará el selector de archivos.** El selector ofrece los mismos tipos de contenido que admite la subida, de modo que un archivo que el servidor rechazaría no se cifra ni se sube antes. [Adjuntos](#ticket-detail/files) trata los topes y el sobre. [[#failure-states]]
**El menú y sus hojas.** \`ComposeActions.svelte\` dibuja el menú y aloja las hojas de respuestas guardadas y de notas, y quienes lo usan deciden qué ofertas le pasan: \`TicketDetailOrchestrator.svelte\` para el caso y \`ReplySheet.svelte\` para la respuesta rápida desde una lista. Las respuestas guardadas vienen de \`030_create_preset_replies.ts\` a través de \`packages/server/src/tickets/preset-service.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè còmpòsè mènù lìsts thè àvàìlàblè àctìòns fòr à tìckèt. Thè èntrìès thàt àppèàr dèpènd òn thè clìènt's còntàct mèthòds ànd thè vòlùntèèr's pèrmìssìòns.
 •••••••••••••••••••••••••••••••••••••••••••••••**Èmàìl. ••** Thè èmàìl còmpòsè shèèt shòws à plàìntèxt wàrnìng bànnèr bècàùsè thè mèssàgè lèàvès thè systèm ùnèncryptèd, ùnlìkè ìn-àpp mèssàgès thàt stày sèàlèd ènd tò ènd.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Àttàchmènts. ••••** Fìlès àttàchèd tò à tìckèt àrè èncryptèd wìth thè pèr tìckèt kèy ùsìng XChàChà20-Pòly1305 ànd stòrèd às èncryptèd bìnàry dàtà. Thè sèrvèr cànnòt dècrypt stòrèd àttàchmènts. ••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The compose menu offers the ways of adding something to a case: a reply on the client's encrypted channel, a text, an email, a file, a saved response, or an ..." |
*
* @param {Demo_Narrative_Topic_Compose_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_compose_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Compose_Actions_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Compose_Actions_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_compose_actions_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_compose_actions_body(inputs)
	return en_demo_narrative_topic_compose_actions_body(inputs)
});