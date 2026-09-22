/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_Exposure_BodyInputs */

const en_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the content appears, the page tells the reader in one short notice that the link itself carried the key, that the server cannot read the message, and that this is why the link works only once. [[#privacy #portal]]
**What the notice is for.** A reader who did not choose this channel has no way to know what was protected and what was not, and the answer changes what they do next with the page. The notice clears itself after a few seconds, blocks nothing and is shown once per link, since the link is consumed on open. [[#privacy #failure-states]]
**What the server sees of a reader.** The identifier of the share and the address the request came from, which is enough to know that a link was opened and from where, and not enough to read what it held. Nothing ties the request to any other conversation the reader may have with the organization. [[#server-holds #metadata]]
**The part the notice does not cover.** The link travels to the reader over a text message, so the carrier and the telephony provider that hand it over see the whole address, key included, before the reader does. Single use limits what a later interception is worth and does not limit an earlier one. [The telephony relay](#deep-dive/the-telephony-relay) covers what those parties hold. [[#telephony #trust-boundary]]
**The notice on the sender's side.** The person who sent the link is warned at the moment they choose the channel that a phone company can read a text message, which is the same fact told to the other party. [Exposure notices](#ticket-detail/exposure-hints) covers that half, and [Share link status](#ticket-detail/share-status) covers what the sender can and cannot learn afterward. [[#telephony #privacy]]
**Where the notice lives.** \`PortalHint.svelte\` in \`packages/client/src/lib/shell/\` renders it with a six-second timeout on the three client surfaces that raise one, and the share page passes its own text and raises it on the transition to decrypted content. [[#portal #privacy]]`)
};

const es_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando aparece el contenido, la página le dice a quien lee, en un aviso breve, que el propio enlace llevaba la clave, que el servidor no puede leer el mensaje y que por eso el enlace funciona una sola vez. [[#privacy #portal]]
**Para qué sirve el aviso.** Quien lee no eligió este canal y no tiene forma de saber qué estaba protegido y qué no, y la respuesta cambia lo que hará después con la página. El aviso se retira solo al cabo de unos segundos, no bloquea nada y se muestra una vez por enlace, ya que el enlace se consume al abrirlo. [[#privacy #failure-states]]
**Lo que el servidor ve de quien lee.** El identificador del recurso compartido y la dirección desde la que llegó la solicitud, que basta para saber que un enlace se abrió y desde dónde, y no basta para leer lo que contenía. Nada vincula la solicitud con ninguna otra conversación que esa persona pueda tener con la organización. [[#server-holds #metadata]]
**La parte que el aviso no cubre.** El enlace llega a quien lee por mensaje de texto, así que la operadora y el proveedor de telefonía que lo entregan ven la dirección entera, clave incluida, antes que quien lee. El uso único acota lo que vale una interceptación posterior y no acota una anterior. [El relay de telefonía](#deep-dive/the-telephony-relay) trata lo que guardan esas partes. [[#telephony #trust-boundary]]
**El aviso del lado de quien envía.** A la persona que envió el enlace se le advierte, en el momento de elegir el canal, de que una compañía telefónica puede leer un mensaje de texto, que es el mismo hecho que se le cuenta a la otra parte. [Avisos de exposición](#ticket-detail/exposure-hints) trata esa mitad, y [Estado de los enlaces compartidos](#ticket-detail/share-status) trata lo que quien envía puede y no puede saber después. [[#telephony #privacy]]
**Dónde vive el aviso.** \`PortalHint.svelte\`, en \`packages/client/src/lib/shell/\`, lo presenta con un tiempo de espera de seis segundos en las tres superficies de cliente que levantan uno, y la página del recurso compartido pasa su propio texto y lo levanta al pasar al contenido descifrado. [[#portal #privacy]]`)
};

const en_xa2_demo_narrative_client_share_exposure_body = /** @type {(inputs: Demo_Narrative_Client_Share_Exposure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦**Prìvàcy. •••** Thè sèrvèr cànnòt rèàd thè shàrè còntènt bècàùsè thè dècryptìòn kèy lìvès ìn thè ÙRL fràgmènt, whìch thè bròwsèr nèvèr sènds ìn à rèqùèst. Thè shàrè lìnk's kèy ìs à frèsh ràndòm vàlùè ùnrèlàtèd tò àny pòrtàl òr àccòùnt crèdèntìàl, sò òpènìng à shàrè lìnk dòès nòt cònnèct thè rèqùèst tò àny òthèr cònvèrsàtìòn thè rèàdèr mày hàvè wìth thè òrgànìzàtìòn. Thè sèrvèr dòès sèè thè shàrè ÌD ànd thè ÌP àddrèss òf thè rèqùèst. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When the content appears, the page tells the reader in one short notice that the link itself carried the key, that the server cannot read the message, and th..." |
*
* @param {Demo_Narrative_Client_Share_Exposure_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_exposure_body = /** @type {((inputs?: Demo_Narrative_Client_Share_Exposure_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_Exposure_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_exposure_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_share_exposure_body(inputs)
	return en_demo_narrative_client_share_exposure_body(inputs)
});