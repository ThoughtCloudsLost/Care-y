/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Share_Link_BodyInputs */

const en_demo_narrative_topic_share_link_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A share link carries one message to someone outside the system, over an address that stops working after the first read or after 72 hours, whichever comes first. [[#portal #encryption]]
**Two copies under two keys.** The message is sealed with a key generated for that one share, bound to the share's identifier so the ciphertext cannot be replayed under another one, and that key travels in the part of the address after the \`#\` that browsers never send. A second copy is sealed with the case key and written to the case thread in the same transaction, so the record of what was sent survives the link's expiry. The server stores both and can open neither. [One-time links](#client-share/one-time) covers what the recipient sees. [[#encryption #keys #server-holds]]
**How it goes out.** With a phone number on file and texting enabled for the organization, the link is sent through the organization's line; otherwise it goes to the clipboard for the user to deliver another way. The share row and the thread entry are written before either, so a text that fails leaves a live link and a complete case record rather than a lost message, and the failure is reported as its own state. [[#telephony #failure-states]]
**What the server keeps and drops.** The row holds the case it belongs to, the ciphertext, a creation time, an expiry and a read time, and no author, because authorship lives in the thread entry instead. The first successful read is settled by a single conditional update, so one reader among several racing gets the content and the rest are told it was already opened, and the ciphertext column is emptied at that moment. [Data retention](#deep-dive/data-retention) covers the sweep that removes the spent rows. [[#server-holds #retention #metadata]]
**The limit and the services.** The message is capped at 64,000 bytes and refuses to send over that. Sending needs permission to manage share links and the organization's share-link policy switched on. The compose path is \`ShareLinkSheet.svelte\` with \`share-crypto.ts\` for the share key, and the server side is \`packages/server/src/portal/share-service.ts\` with the row from \`091_share_links.ts\`. [[#permissions #encryption]]`)
};

const es_demo_narrative_topic_share_link_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un enlace compartido lleva un solo mensaje a alguien de fuera del sistema, por una dirección que deja de funcionar tras la primera lectura o a las 72 horas, lo que ocurra antes. [[#portal #encryption]]
**Dos copias con dos claves.** El mensaje se sella con una clave generada para ese único envío, ligada a su identificador para que el texto cifrado no pueda reutilizarse bajo otro, y esa clave viaja en la parte de la dirección posterior al \`#\` que los navegadores nunca envían. Una segunda copia se sella con la clave del caso y se escribe en el hilo del caso dentro de la misma transacción, de modo que el registro de lo enviado sobrevive a la caducidad del enlace. El servidor guarda las dos y no puede abrir ninguna. [Enlaces de un solo uso](#client-share/one-time) trata lo que ve quien lo recibe. [[#encryption #keys #server-holds]]
**Cómo sale.** Con un número de teléfono registrado y los mensajes de texto habilitados en la organización, el enlace sale por la línea de la organización; si no, va al portapapeles para que la persona usuaria lo entregue de otro modo. La fila del envío y la entrada del hilo se escriben antes que cualquiera de las dos cosas, así que un mensaje de texto fallido deja un enlace vivo y un registro del caso completo en lugar de un mensaje perdido, y el fallo se informa como estado propio. [[#telephony #failure-states]]
**Lo que el servidor guarda y suelta.** La fila contiene el caso al que pertenece, el texto cifrado, una fecha de creación, una de caducidad y una de lectura, y ninguna autoría, porque la autoría vive en la entrada del hilo. La primera lectura con éxito se resuelve con una sola actualización condicional, de modo que entre varias lecturas simultáneas una obtiene el contenido y a las demás se les indica que ya se había abierto, y la columna del texto cifrado se vacía en ese momento. [Retención de datos](#deep-dive/data-retention) trata el barrido que retira las filas gastadas. [[#server-holds #retention #metadata]]
**El límite y los servicios.** El mensaje tiene un tope de 64.000 bytes y no se envía por encima de él. Enviarlo necesita permiso para gestionar enlaces compartidos y que la política de enlaces compartidos de la organización esté activa. El camino de redacción es \`ShareLinkSheet.svelte\` con \`share-crypto.ts\` para la clave del envío, y el lado del servidor es \`packages/server/src/portal/share-service.ts\` con la fila de \`091_share_links.ts\`. [[#permissions #encryption]]`)
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
* | "A share link carries one message to someone outside the system, over an address that stops working after the first read or after 72 hours, whichever comes fi..." |
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