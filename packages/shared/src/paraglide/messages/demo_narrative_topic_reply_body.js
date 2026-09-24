/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Reply_BodyInputs */

const en_demo_narrative_topic_reply_body = /** @type {(inputs: Demo_Narrative_Topic_Reply_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a volunteer sends a reply, the message is encrypted on the device with the per ticket key before it reaches the server. The server stores the ciphertext and delivers it to the recipient.
**SMS replies.** If the channel is SMS, the server forwards the message to the telephony provider through a stateless relay that reads the request body as a raw buffer and zeros it from memory immediately after forwarding. The relay never creates a JavaScript string from the content, and the server does not store or log the outbound message. A residual risk is acknowledged in the code: the telephony provider's SDK may create internal string copies that persist until garbage collection.
**Delivery confirmation.** The thread shows delivery status for each outbound message so the volunteer knows whether the message reached the client.`)
};

const es_demo_narrative_topic_reply_body = /** @type {(inputs: Demo_Narrative_Topic_Reply_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando un voluntario envía una respuesta, el mensaje se cifra en el dispositivo con la clave por ticket antes de llegar al servidor. El servidor almacena el texto cifrado y lo entrega al destinatario.
**Respuestas por SMS.** Si el canal es SMS, el servidor reenvia el mensaje al proveedor de telefonía a través de un relay sin estado que lee el cuerpo de la solicitud como un buffer crudo y lo borra de memoria inmediatamente después del reenvío. El relay nunca crea una cadena JavaScript del contenido, y el servidor no almacena ni registra el mensaje saliente. Se reconoce un riesgo residual en el código: el SDK del proveedor de telefonía puede crear copias internas de cadenas que persisten hasta la recolección de basura.
**Confirmación de entrega.** El hilo muestra el estado de entrega de cada mensaje saliente para que el voluntario sepa si el mensaje llegó al cliente.`)
};

const en_xa2_demo_narrative_topic_reply_body = /** @type {(inputs: Demo_Narrative_Topic_Reply_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn à vòlùntèèr sènds à rèply, thè mèssàgè ìs èncryptèd òn thè dèvìcè wìth thè pèr tìckèt kèy bèfòrè ìt rèàchès thè sèrvèr. Thè sèrvèr stòrès thè cìphèrtèxt ànd dèlìvèrs ìt tò thè rècìpìènt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**SMS rèplìès. ••••** Ìf thè chànnèl ìs SMS, thè sèrvèr fòrwàrds thè mèssàgè tò thè tèlèphòny pròvìdèr thròùgh à stàtèlèss rèlày thàt rèàds thè rèqùèst bòdy às à ràw bùffèr ànd zèròs ìt fròm mèmòry ìmmèdìàtèly àftèr fòrwàrdìng. Thè rèlày nèvèr crèàtès à JàvàScrìpt strìng fròm thè còntènt, ànd thè sèrvèr dòès nòt stòrè òr lòg thè òùtbòùnd mèssàgè. À rèsìdùàl rìsk ìs àcknòwlèdgèd ìn thè còdè: thè tèlèphòny pròvìdèr's SDK mày crèàtè ìntèrnàl strìng còpìès thàt pèrsìst ùntìl gàrbàgè còllèctìòn.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dèlìvèry cònfìrmàtìòn. •••••••** Thè thrèàd shòws dèlìvèry stàtùs fòr èàch òùtbòùnd mèssàgè sò thè vòlùntèèr knòws whèthèr thè mèssàgè rèàchèd thè clìènt. •••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When a volunteer sends a reply, the message is encrypted on the device with the per ticket key before it reaches the server. The server stores the ciphertext..." |
*
* @param {Demo_Narrative_Topic_Reply_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_reply_body = /** @type {((inputs?: Demo_Narrative_Topic_Reply_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Reply_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_reply_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_reply_body(inputs)
	return en_demo_narrative_topic_reply_body(inputs)
});