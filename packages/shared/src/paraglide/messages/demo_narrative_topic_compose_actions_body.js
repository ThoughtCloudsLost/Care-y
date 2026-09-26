/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Compose_Actions_BodyInputs */

const en_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The compose menu offers a reply on the client's encrypted channel, a text, an email, a file, a preset reply, or an internal note. [[#client-data]]
**Which options does the menu offer?** The menu offers an option only when the channel is available:
- A reply requires that the client has a portal channel and that the organization has secure links switched on.
- A text requires that the ticket has a phone number on file and that the SMS channel is on.
- An email requires that the ticket has an email address on file and that the email channel is on.
- Files, preset replies, and notes are always offered.
The server checks every send against the permission for that channel. A hidden option is not what prevents an unauthorized request. [Channel policy](#admin-comms/channel-policy) covers the switches, and [The permission system](#deep-dive/the-permission-system) covers the grants. [[#permissions #portal #telephony]]
**Channel exposure.** A reply stays sealed for the client's own browser. A text reaches a phone company in a form it can read. An email is readable by every mail server between the sender and the recipient. The compose bar warns once per session when the account chooses a text or a call. [Sending a reply](#ticket-detail/reply) covers what each channel seals, and [Channel warnings](#ticket-detail/exposure-hints) covers when the warning appears. [[#encryption #telephony #privacy]]
**Preset replies.** A preset reply is organization text sealed with the organization key. The browser decrypts it. The compose bar places the text into the draft, and the account can edit it before sending. Each preset reply belongs to one queue or to the whole organization. [[#encryption #client-data]]
**File picker limits.** The picker offers the same content types the upload endpoint accepts. The browser does not encrypt or upload a file the endpoint would refuse. [File attachments](#ticket-detail/files) covers the size caps and the encryption envelope. [[#failure-states]]
**The compose component and its callers.** \`ComposeActions.svelte\` renders the menu and hosts the preset-reply and note sheets. Callers decide which options to pass: \`TicketDetailOrchestrator.svelte\` for the ticket detail page, \`ReplySheet.svelte\` for the quick reply from a list. Preset replies come from \`030_create_preset_replies.ts\` through \`packages/server/src/tickets/preset-service.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El menú de composición ofrece una respuesta en el canal cifrado del cliente, un texto, un correo electrónico, un archivo, una respuesta predefinida o una nota interna. [[#client-data]]
**¿Qué opciones ofrece el menú?** El menú ofrece una opción solo cuando el canal está disponible:
- Una respuesta requiere que el cliente tenga un canal del portal y que la organización tenga los enlaces seguros activados.
- Un texto requiere que el ticket tenga un número de teléfono registrado y que el canal SMS esté activado.
- Un correo electrónico requiere que el ticket tenga una dirección de correo registrada y que el canal de correo esté activado.
- Los archivos, las respuestas predefinidas y las notas siempre se ofrecen.
El servidor comprueba cada envío contra el permiso de ese canal. Una opción oculta no es lo que impide una solicitud no autorizada. [Política de canales](#admin-comms/channel-policy) cubre los interruptores, y [El sistema de permisos](#deep-dive/the-permission-system) cubre las concesiones. [[#permissions #portal #telephony]]
**Exposición del canal.** Una respuesta permanece sellada para el navegador del propio cliente. Un texto llega a una compañía telefónica en una forma que puede leer. Un correo electrónico es legible por cada servidor de correo entre el remitente y el destinatario. La barra de composición avisa una vez por sesión cuando la cuenta elige un texto o una llamada. [Enviando una respuesta](#ticket-detail/reply) cubre lo que sella cada canal, y [Avisos de canal](#ticket-detail/exposure-hints) cubre cuándo aparece el aviso. [[#encryption #telephony #privacy]]
**Respuestas predefinidas.** Una respuesta predefinida es texto de la organización sellado con la clave de organización. El navegador lo descifra. La barra de composición coloca el texto en el borrador, y la cuenta puede editarlo antes de enviar. Cada respuesta predefinida pertenece a una cola o a toda la organización. [[#encryption #client-data]]
**Límites del selector de archivos.** El selector ofrece los mismos tipos de contenido que acepta el endpoint de subida. El navegador no cifra ni sube un archivo que el endpoint rechazaría. [Archivos adjuntos](#ticket-detail/files) cubre los límites de tamaño y el sobre de cifrado. [[#failure-states]]
**El componente de composición y sus consumidores.** \`ComposeActions.svelte\` renderiza el menú y aloja las hojas de respuesta predefinida y de nota. Los consumidores deciden qué opciones pasar: \`TicketDetailOrchestrator.svelte\` para la página de detalle del ticket, \`ReplySheet.svelte\` para la respuesta rápida desde una lista. Las respuestas predefinidas provienen de \`030_create_preset_replies.ts\` a través de \`packages/server/src/tickets/preset-service.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè còmpòsè mènù òffèrs à rèply òn thè clìènt's èncryptèd chànnèl, à tèxt, àn èmàìl, à fìlè, à prèsèt rèply, òr àn ìntèrnàl nòtè. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••**Whìch òptìòns dòès thè mènù òffèr? •••••••••••** Thè mènù òffèrs àn òptìòn ònly whèn thè chànnèl ìs àvàìlàblè:
- À rèply rèqùìrès thàt thè clìènt hàs à pòrtàl chànnèl ànd thàt thè òrgànìzàtìòn hàs sècùrè lìnks swìtchèd òn.
- À tèxt rèqùìrès thàt thè tìckèt hàs à phònè nùmbèr òn fìlè ànd thàt thè SMS chànnèl ìs òn.
- Àn èmàìl rèqùìrès thàt thè tìckèt hàs àn èmàìl àddrèss òn fìlè ànd thàt thè èmàìl chànnèl ìs òn.
- Fìlès, prèsèt rèplìès, ànd nòtès àrè àlwàys òffèrèd.
Thè sèrvèr chècks èvèry sènd àgàìnst thè pèrmìssìòn fòr thàt chànnèl. À hìddèn òptìòn ìs nòt whàt prèvènts àn ùnàùthòrìzèd rèqùèst. [Chànnèl pòlìcy](#àdmìn-còmms/chànnèl-pòlìcy) còvèrs thè swìtchès, ànd [Thè pèrmìssìòn systèm](#dèèp-dìvè/thè-pèrmìssìòn-systèm) còvèrs thè grànts. [[#pèrmìssìòns #pòrtàl #tèlèphòny]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Chànnèl èxpòsùrè. ••••••** À rèply stàys sèàlèd fòr thè clìènt's òwn bròwsèr. À tèxt rèàchès à phònè còmpàny ìn à fòrm ìt càn rèàd. Àn èmàìl ìs rèàdàblè by èvèry màìl sèrvèr bètwèèn thè sèndèr ànd thè rècìpìènt. Thè còmpòsè bàr wàrns òncè pèr sèssìòn whèn thè àccòùnt chòòsès à tèxt òr à càll. [Sèndìng à rèply](#tìckèt-dètàìl/rèply) còvèrs whàt èàch chànnèl sèàls, ànd [Chànnèl wàrnìngs](#tìckèt-dètàìl/èxpòsùrè-hìnts) còvèrs whèn thè wàrnìng àppèàrs. [[#èncryptìòn #tèlèphòny #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Prèsèt rèplìès. •••••** À prèsèt rèply ìs òrgànìzàtìòn tèxt sèàlèd wìth thè òrgànìzàtìòn kèy. Thè bròwsèr dècrypts ìt. Thè còmpòsè bàr plàcès thè tèxt ìntò thè dràft, ànd thè àccòùnt càn èdìt ìt bèfòrè sèndìng. Èàch prèsèt rèply bèlòngs tò ònè qùèùè òr tò thè whòlè òrgànìzàtìòn. [[#èncryptìòn #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Fìlè pìckèr lìmìts. ••••••** Thè pìckèr òffèrs thè sàmè còntènt typès thè ùplòàd èndpòìnt àccèpts. Thè bròwsèr dòès nòt èncrypt òr ùplòàd à fìlè thè èndpòìnt wòùld rèfùsè. [Fìlè àttàchmènts](#tìckèt-dètàìl/fìlès) còvèrs thè sìzè càps ànd thè èncryptìòn ènvèlòpè. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè còmpòsè còmpònènt ànd ìts càllèrs. ••••••••••••** \`CòmpòsèÀctìòns.svèltè\` rèndèrs thè mènù ànd hòsts thè prèsèt-rèply ànd nòtè shèèts. Càllèrs dècìdè whìch òptìòns tò pàss: \`TìckètDètàìlÒrchèstràtòr.svèltè\` fòr thè tìckèt dètàìl pàgè, \`RèplyShèèt.svèltè\` fòr thè qùìck rèply fròm à lìst. Prèsèt rèplìès còmè fròm \`030_crèàtè_prèsèt_rèplìès.ts\` thròùgh \`pàckàgès/sèrvèr/src/tìckèts/prèsèt-sèrvìcè.ts\`. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The compose menu offers a reply on the client's encrypted channel, a text, an email, a file, a preset reply, or an internal note. [[#client-data]] **Which op..." |
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