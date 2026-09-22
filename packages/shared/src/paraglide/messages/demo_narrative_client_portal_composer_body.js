/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Portal_Composer_BodyInputs */

const en_demo_narrative_client_portal_composer_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Composer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A reply is encrypted in the browser before it is sent, so what the server receives and stores is ciphertext it cannot open, and the client can write up to 5,000 characters with a count appearing from 4,500 on. [[#portal #encryption]]
**Two sealed copies of one reply.** The text is encrypted once under a key minted for that message. One wrap of that key is sealed to the channel key so the client can reread their own message on a later visit, and a second wrap is sealed to the organization's public key so whoever picks the case up can open it. The first person in the organization to open it re-encrypts the message under the case key and the organization-key wrap is deleted in that same write, after which only accounts holding a wrap of the case key can read it. [How encryption works](#deep-dive/how-encryption-works) covers the two key layers. [[#encryption #keys #server-holds]]
**What a send does to the case.** A reply on a closed case reopens it, and the notification to the organization is written in the same transaction as the message, so a reply that is stored is a reply that is announced. The composer reports a failed send and puts the text back for the client to retry, and it makes no claim about whether a stored reply has been read. [[#failure-states #portal]]
**How often a client can write.** A conversation accepts thirty replies an hour, and a reply from the organization clears that window, so a two-sided exchange is not interrupted by its own pace. A second, coarser cap counts writes per address per hour and skips any channel the organization has replied to in the last hour, which bounds flooding without the server keeping a record of which address writes to which conversation. A refusal names the wait. [[#failure-states #privacy]]
**When replies are turned off.** An organization that switches the secure link channel off at the policy level leaves existing links readable and refuses new replies, and the composer reports that rather than letting a send fail without explanation. [Channel policy](#admin-comms/channel-policy) covers the switch. [[#permissions #portal]]
**Unsent text.** A draft is held in the tab's memory under the channel it belongs to, so it survives moving around inside the session and is gone when the tab closes. Nothing unsent is written to the device. [[#privacy #client-data]]
**The compose path and the wrap tables.** \`PortalComposer.svelte\` and the in-memory draft store \`packages/client/src/lib/tickets/draft-store.svelte.ts\` are the browser side, the encryption runs in the portal worker under \`packages/client/src/lib/workers/\`, and the server writes the follow-up, the organization-key wrap and the client's own copy in one transaction in \`clientReply\` in \`packages/server/src/portal/portal-message-service.ts\`. The wrap is removed by \`packages/server/src/tickets/rewrap-service.ts\`. [[#portal #encryption]]`)
};

const es_demo_narrative_client_portal_composer_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Composer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una respuesta se cifra en el navegador antes de enviarse, de modo que lo que el servidor recibe y guarda es texto cifrado que no puede abrir, y el cliente puede escribir hasta 5.000 caracteres, con una cuenta que aparece a partir de los 4.500. [[#portal #encryption]]
**Dos copias selladas de una misma respuesta.** El texto se cifra una vez con una clave acuñada para ese mensaje. Una envoltura de esa clave se sella con la clave del canal para que el cliente pueda releer su propio mensaje en una visita posterior, y una segunda se sella con la clave pública de la organización para que quien tome el caso pueda abrirlo. La primera persona de la organización que lo abre vuelve a cifrar el mensaje con la clave del caso y la envoltura de la clave de la organización se elimina en esa misma escritura, tras lo cual solo pueden leerlo las cuentas que tienen una envoltura de la clave del caso. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata las dos capas de claves. [[#encryption #keys #server-holds]]
**Qué le hace un envío al caso.** Una respuesta en un caso cerrado lo reabre, y el aviso a la organización se escribe en la misma transacción que el mensaje, así que una respuesta guardada es una respuesta anunciada. El compositor informa de un envío fallido y devuelve el texto para que el cliente lo reintente, y no afirma nada sobre si una respuesta guardada se ha leído. [[#failure-states #portal]]
**Con qué frecuencia puede escribir un cliente.** Una conversación acepta treinta respuestas por hora, y una respuesta de la organización reinicia esa ventana, de modo que un intercambio entre dos partes no se interrumpe por su propio ritmo. Un segundo límite, más amplio, cuenta las escrituras por dirección y por hora y omite todo canal al que la organización haya respondido en la última hora, lo que acota una inundación sin que el servidor registre qué dirección escribe en qué conversación. El rechazo indica cuánto hay que esperar. [[#failure-states #privacy]]
**Cuando las respuestas están desactivadas.** Una organización que desactiva el canal de enlace seguro a nivel de política deja legibles los enlaces existentes y rechaza las respuestas nuevas, y el compositor lo informa en lugar de dejar que un envío falle sin explicación. [Política de canales](#admin-comms/channel-policy) trata ese interruptor. [[#permissions #portal]]
**El texto sin enviar.** Un borrador se guarda en la memoria de la pestaña bajo el canal al que pertenece, así que sobrevive al movimiento dentro de la sesión y desaparece al cerrar la pestaña. Nada sin enviar se escribe en el dispositivo. [[#privacy #client-data]]
**La ruta de composición y las tablas de envolturas.** \`PortalComposer.svelte\` y el almacén de borradores en memoria \`packages/client/src/lib/tickets/draft-store.svelte.ts\` son el lado del navegador, el cifrado corre en el worker del portal, bajo \`packages/client/src/lib/workers/\`, y el servidor escribe el seguimiento, la envoltura de la clave de la organización y la copia propia del cliente en una sola transacción, en \`clientReply\`, en \`packages/server/src/portal/portal-message-service.ts\`. La envoltura la elimina \`packages/server/src/tickets/rewrap-service.ts\`. [[#portal #encryption]]`)
};

const en_xa2_demo_narrative_client_portal_composer_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Composer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè pòrtàl rèply còmpòsèr èncrypts èàch mèssàgè ìn thè bròwsèr bèfòrè sèndìng thè cìphèrtèxt tò thè sèrvèr, wìth à lìmìt òf 5000 chàràctèrs ànd à còùntèr thàt àppèàrs àt 4500.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìf ìt fàìls. ••••** Ìf à sènd fàìls thè còmpòsèr rèstòrès thè mèssàgè tèxt sò thè clìènt càn rètry wìthòùt rètypìng.
 ••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Èàch rèply ìs èncryptèd twìcè sò bòth sìdès càn rèàd ìt. À còpy sèàlèd tò thè pòrtàl chànnèl kèy lèts thè clìènt dècrypt ìt òn fùtùrè vìsìts, ànd à còntènt kèy sèàlèd tò thè òrgànìzàtìòn's pùblìc kèy lèts àny ùsèr wìth thè òrgànìzàtìòn kèy dècrypt ìt. Thàt òrgànìzàtìòn kèy còpy ìs cònsùmèd ànd dèlètèd thè fìrst tìmè à ùsèr òpèns thè mèssàgè, àftèr whìch ònly ùsèrs whò hòld pèr tìckèt kèy wràps càn rèàd ìt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Ùnsènt tèxt ìn thè còmpòsè bàr sùrvìvès nàvìgàtìòn wìthìn thè sèssìòn bùt nèvèr òùtlìvès thè tàb, sò clòsìng thè bròwsèr lèàvès nò dràft òn thè dèvìcè. ••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A reply is encrypted in the browser before it is sent, so what the server receives and stores is ciphertext it cannot open, and the client can write up to 5,..." |
*
* @param {Demo_Narrative_Client_Portal_Composer_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_composer_body = /** @type {((inputs?: Demo_Narrative_Client_Portal_Composer_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Composer_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_composer_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_portal_composer_body(inputs)
	return en_demo_narrative_client_portal_composer_body(inputs)
});