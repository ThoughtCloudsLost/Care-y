/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Exposure_Hints_BodyInputs */

const en_demo_narrative_topic_exposure_hints_body = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choosing a channel that carries content outside the encrypted path raises a notice saying what that channel exposes. [[#privacy #telephony]]
**What each notice says.** The text notice says a phone company can read the message. The call notice says a phone company can hear the call. Both name the party that gains access, rather than calling the channel insecure, because the exposure is to a specific company that keeps records and answers legal demands. [The telephony relay](#deep-dive/the-telephony-relay) covers what the carrier and the provider hold. [[#telephony #server-holds]]
**When they are raised.** Once per kind per session, on the choice rather than on the send, and a notice clears itself after a few seconds. Neither notice blocks the action: the user decides, and they are told before the decision rather than after it. A reload raises them again. [[#failure-states]]
**Email is warned differently.** Composing an email opens its own surface, which carries a standing warning rather than a passing notice, and every inbound email carries a caution of its own about how easily a sender's address is faked. [Email on a case](#ticket-detail/email-thread) covers both. [[#privacy]]
**What the notices do not cover.** They report what the channel exposes, not what the recipient's device or mailbox does with it afterwards, and they say nothing about whether a message arrived. [Share link status](#ticket-detail/share-status) covers that limit for share links. [[#failure-states]]
**Where the state lives.** \`create-exposure-hint.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` holds the shown set for the session, and \`ExposureHint.svelte\` renders one with a six-second timeout. The equivalent notice on the client's side is [Exposure notice](#client-share/exposure-hint). [[#client-data]]`)
};

const es_demo_narrative_topic_exposure_hints_body = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elegir un canal que lleva contenido fuera del camino cifrado levanta un aviso que dice qué expone ese canal. [[#privacy #telephony]]
**Qué dice cada aviso.** El aviso del mensaje de texto dice que una compañía telefónica puede leerlo. El aviso de la llamada dice que una compañía telefónica puede oírla. Los dos nombran a quien obtiene el acceso en lugar de llamar inseguro al canal, porque la exposición es ante una empresa concreta que guarda registros y responde a requerimientos legales. [El relé de telefonía](#deep-dive/the-telephony-relay) trata lo que guardan la operadora y el proveedor. [[#telephony #server-holds]]
**Cuándo se levantan.** Una vez por tipo y por sesión, al elegir y no al enviar, y el aviso se retira solo a los pocos segundos. Ninguno de los dos bloquea la acción: decide la persona usuaria, y se le dice antes de decidir y no después. Una recarga vuelve a levantarlos. [[#failure-states]]
**El correo se advierte de otra manera.** Redactar un correo abre una superficie propia, que lleva una advertencia permanente en lugar de un aviso pasajero, y cada correo entrante lleva su propia advertencia sobre lo fácil que es falsificar la dirección de quien lo envía. [El correo en un caso](#ticket-detail/email-thread) trata ambas. [[#privacy]]
**Lo que los avisos no cubren.** Indican qué expone el canal, no lo que el dispositivo o el buzón de quien recibe hagan después con ello, y no dicen nada sobre si un mensaje llegó. [Estado del enlace compartido](#ticket-detail/share-status) trata ese límite para los enlaces compartidos. [[#failure-states]]
**Dónde vive el estado.** \`create-exposure-hint.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, guarda el conjunto de avisos ya mostrados durante la sesión, y \`ExposureHint.svelte\` dibuja uno con un tiempo de seis segundos. El aviso equivalente del lado del cliente es [Aviso de exposición](#client-share/exposure-hint). [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_exposure_hints_body = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn thè ùsèr ìnìtìàtès àn SMS rèply òr à phònè càll fròm à tìckèt, à brìèf nòtìcè àppèàrs rèmìndìng thèm thàt thè chànnèl ìs nòt èncryptèd.
 •••••••••••••••••••••••••••••••••••••••••••**SMS wàrnìng. ••••** "SMS ìs nòt èncryptèd ànd yòùr phònè pròvìdèr càn rèàd ìt. Kèèp sènsìtìvè dètàìls ìn thè èncryptèd chàt."
 •••••••••••••••••••••••••••••••••**Càll wàrnìng. ••••** "Thìs càll ròùtès thròùgh yòùr phònè pròvìdèr ànd thèy càn hèàr thè càll. Kèèp sènsìtìvè dètàìls ìn thè èncryptèd chàt."
 •••••••••••••••••••••••••••••••••••••**Frèqùèncy. •••** Èàch wàrnìng àppèàrs òncè pèr sèssìòn, ànd àftèr thè ùsèr dìsmìssès ìt thè sàmè wàrnìng dòès nòt rèàppèàr ùntìl thè pàgè ìs rèlòàdèd, sò thè wàrnìngs àrè ìnfòrmàtìònàl ànd nèvèr blòck thè àctìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èmàìl. ••** Èmàìl wàrnìngs wòrk dìffèrèntly fròm SMS ànd càll wàrnìngs. Còmpòsìng àn èmàìl òpèns à dìstìnct còmpòsè shèèt ràthèr thàn thè stàndàrd mèssàgè ìnpùt, ànd bècàùsè thìs sùrfàcè ìs spècìfìc tò èmàìl ìt càrrìès à pèrsìstènt wàrnìng bànnèr àbòvè thè èdìtòr ràthèr thàn à ònè tìmè nòtìcè, sìncè thè sèpàràtè shèèt ìtsèlf sìgnàls thè ùsèr ìs dòìng sòmèthìng dìffèrènt fròm sèndìng àn èncryptèd mèssàgè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Choosing a channel that carries content outside the encrypted path raises a notice saying what that channel exposes. [[#privacy #telephony]] **What each noti..." |
*
* @param {Demo_Narrative_Topic_Exposure_Hints_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_exposure_hints_body = /** @type {((inputs?: Demo_Narrative_Topic_Exposure_Hints_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Exposure_Hints_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_exposure_hints_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_exposure_hints_body(inputs)
	return en_demo_narrative_topic_exposure_hints_body(inputs)
});