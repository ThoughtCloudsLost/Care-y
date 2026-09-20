/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Share_Link_BodyInputs */

const en_demo_narrative_topic_share_link_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The share link sheet lets a volunteer compose a message and send it as a single use link to someone outside the system.
**Composing.** The sheet has a text field for the content. A character limit is enforced with a visible counter near the cap.
**Delivery.** When the client has a phone number on file and SMS is enabled for the organization, the sheet sends the link by text through the organization's phone line. Otherwise, the sheet copies the link to the clipboard so the volunteer can deliver it another way.
**Encryption.** The content is encrypted under a fresh random key, and that key is placed in the URL fragment so the server never sees it. A copy of the content is also encrypted under the ticket key and stored as a follow-up on the ticket, so the conversation record stays complete.
**Case record.** After sending, a share link message appears in the ticket thread with a status line below it showing whether the link has been opened.`)
};

const es_demo_narrative_topic_share_link_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La hoja de enlace compartido permite que un voluntario redacte un mensaje y lo envíe como un enlace de un solo uso a alguien fuera del sistema.
**Redacción.** La hoja tiene un campo de texto para el contenido. Se aplica un límite de caracteres con un contador visible cerca del máximo.
**Entrega.** Cuando el cliente tiene un número de teléfono registrado y el SMS está habilitado para la organización, la hoja envía el enlace por texto a través de la línea telefónica de la organización. De lo contrario, la hoja copia el enlace al portapapeles para que el voluntario pueda entregarlo de otra manera.
**Cifrado.** El contenido se cifra con una clave aleatoria nueva, y esa clave se coloca en el fragmento de la URL para que el servidor nunca la vea. Una copia del contenido también se cifra con la clave del ticket y se almacena como seguimiento en el ticket, para que el registro de la conversación se mantenga completo.
**Registro del caso.** Después de enviar, un mensaje de enlace compartido aparece en el hilo del ticket con una línea de estado debajo mostrando si el enlace ha sido abierto.`)
};

const en_xa2_demo_narrative_topic_share_link_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè shàrè lìnk shèèt lèts à vòlùntèèr còmpòsè à mèssàgè ànd sènd ìt às à sìnglè ùsè lìnk tò sòmèònè òùtsìdè thè systèm.
 ••••••••••••••••••••••••••••••••••••**Còmpòsìng. •••** Thè shèèt hàs à tèxt fìèld fòr thè còntènt. À chàràctèr lìmìt ìs ènfòrcèd wìth à vìsìblè còùntèr nèàr thè càp.
 ••••••••••••••••••••••••••••••••••**Dèlìvèry. •••** Whèn thè clìènt hàs à phònè nùmbèr òn fìlè ànd SMS ìs ènàblèd fòr thè òrgànìzàtìòn, thè shèèt sènds thè lìnk by tèxt thròùgh thè òrgànìzàtìòn's phònè lìnè. Òthèrwìsè, thè shèèt còpìès thè lìnk tò thè clìpbòàrd sò thè vòlùntèèr càn dèlìvèr ìt ànòthèr wày.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè còntènt ìs èncryptèd ùndèr à frèsh ràndòm kèy, ànd thàt kèy ìs plàcèd ìn thè ÙRL fràgmènt sò thè sèrvèr nèvèr sèès ìt. À còpy òf thè còntènt ìs àlsò èncryptèd ùndèr thè tìckèt kèy ànd stòrèd às à fòllòw-ùp òn thè tìckèt, sò thè cònvèrsàtìòn rècòrd stàys còmplètè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Càsè rècòrd. ••••** Àftèr sèndìng, à shàrè lìnk mèssàgè àppèàrs ìn thè tìckèt thrèàd wìth à stàtùs lìnè bèlòw ìt shòwìng whèthèr thè lìnk hàs bèèn òpènèd. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The share link sheet lets a volunteer compose a message and send it as a single use link to someone outside the system. **Composing.** The sheet has a text f..." |
*
* @param {Demo_Narrative_Topic_Share_Link_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_share_link_body = /** @type {((inputs?: Demo_Narrative_Topic_Share_Link_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Share_Link_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_share_link_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_share_link_body(inputs)
	return en_demo_narrative_topic_share_link_body(inputs)
});