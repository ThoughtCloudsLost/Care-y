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
	return /** @type {LocalizedString} */ (`⟦Chòòsìng à chànnèl thàt càrrìès còntènt òùtsìdè thè èncryptèd pàth ràìsès à nòtìcè sàyìng whàt thàt chànnèl èxpòsès. [[#prìvàcy #tèlèphòny]]
 •••••••••••••••••••••••••••••••••••••••••••**Whàt èàch nòtìcè sàys. •••••••** Thè tèxt nòtìcè sàys à phònè còmpàny càn rèàd thè mèssàgè. Thè càll nòtìcè sàys à phònè còmpàny càn hèàr thè càll. Bòth nàmè thè pàrty thàt gàìns àccèss, ràthèr thàn càllìng thè chànnèl ìnsècùrè, bècàùsè thè èxpòsùrè ìs tò à spècìfìc còmpàny thàt kèèps rècòrds ànd ànswèrs lègàl dèmànds. [Thè tèlèphòny rèlày](#dèèp-dìvè/thè-tèlèphòny-rèlày) còvèrs whàt thè càrrìèr ànd thè pròvìdèr hòld. [[#tèlèphòny #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn thèy àrè ràìsèd. •••••••** Òncè pèr kìnd pèr sèssìòn, òn thè chòìcè ràthèr thàn òn thè sènd, ànd à nòtìcè clèàrs ìtsèlf àftèr à fèw sècònds. Nèìthèr nòtìcè blòcks thè àctìòn: thè ùsèr dècìdès, ànd thèy àrè tòld bèfòrè thè dècìsìòn ràthèr thàn àftèr ìt. À rèlòàd ràìsès thèm àgàìn. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èmàìl ìs wàrnèd dìffèrèntly. •••••••••** Còmpòsìng àn èmàìl òpèns ìts òwn sùrfàcè, whìch càrrìès à stàndìng wàrnìng ràthèr thàn à pàssìng nòtìcè, ànd èvèry ìnbòùnd èmàìl càrrìès à càùtìòn òf ìts òwn àbòùt hòw èàsìly à sèndèr's àddrèss ìs fàkèd. [Èmàìl òn à càsè](#tìckèt-dètàìl/èmàìl-thrèàd) còvèrs bòth. [[#prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè nòtìcès dò nòt còvèr. •••••••••** Thèy rèpòrt whàt thè chànnèl èxpòsès, nòt whàt thè rècìpìènt's dèvìcè òr màìlbòx dòès wìth ìt àftèrwàrds, ànd thèy sày nòthìng àbòùt whèthèr à mèssàgè àrrìvèd. [Shàrè lìnk stàtùs](#tìckèt-dètàìl/shàrè-stàtùs) còvèrs thàt lìmìt fòr shàrè lìnks. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè thè stàtè lìvès. •••••••** \`crèàtè-èxpòsùrè-hìnt.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\` hòlds thè shòwn sèt fòr thè sèssìòn, ànd \`ÈxpòsùrèHìnt.svèltè\` rèndèrs ònè wìth à sìx-sècònd tìmèòùt. Thè èqùìvàlènt nòtìcè òn thè clìènt's sìdè ìs [Èxpòsùrè nòtìcè](#clìènt-shàrè/èxpòsùrè-hìnt). [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
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