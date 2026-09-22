/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_View_BodyInputs */

const en_demo_narrative_client_share_view_body = /** @type {(inputs: Demo_Narrative_Client_Share_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opening a share link fetches one encrypted message from the server and decrypts it on the reader's own device, with no account, no sign-in and nothing to install. [[#portal #encryption]]
**Which half of the address the server sees.** The identifier of the share is in the path and the key that opens it is after the \`#\`, which browsers never send in a request. The server answers with ciphertext it cannot read, and the page removes the key from the address bar once it has been used, so the key is absent from the history entry and from an address the reader forwards. [How encryption works](#deep-dive/how-encryption-works) covers the sealing. [[#keys #server-holds]]
**Why the key only opens this one message.** The key is a fresh random value made for this share alone, bound to the share's identifier so the same ciphertext cannot be replayed under another one, and unrelated to any portal or account credential the reader may also hold. Opening a share link connects the request to no other conversation. [[#encryption #privacy]]
**What the reader can be told instead of content.** A link that arrives truncated or broken reports an incomplete link rather than a failure, which is the likeliest real problem because these links travel by text message and a message can be split. The other end states are covered by [Single use access](#client-share/one-time). [[#failure-states #telephony]]
**What cannot be taken back once the message is decrypted.** The decrypted text is an ordinary string in the device's memory, which cannot be wiped the way a key can. Quick exit drops the page's reference to it and navigates away, and a screenshot, a copy or a printed page stays where the reader put it. [Quick exit](#client-portal/quick-exit) covers what that control does and does not reach. [[#failure-states #privacy]]
**How often a share can be asked for.** Open requests are capped per address per minute, at ten, which bounds a sweep through guessed identifiers without getting in the way of one reader opening one link. [[#failure-states]]
**The view page and the share key.** The page is \`packages/client/src/routes/(client)/share/[id]/+page.svelte\` and the sealing pair is \`encryptShare\` and \`decryptShare\` in \`packages/client/src/lib/portal/share-crypto.ts\`, which runs on the main thread because the page has no session and no worker. The server side is \`openShare\` in \`packages/server/src/portal/share-service.ts\` against the row from \`091_share_links.ts\`. [Share link](#ticket-detail/share-link) covers the other end. [[#encryption #server-holds]]`)
};

const es_demo_narrative_client_share_view_body = /** @type {(inputs: Demo_Narrative_Client_Share_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abrir un enlace compartido descarga un único mensaje cifrado del servidor y lo descifra en el propio dispositivo de quien lee, sin cuenta, sin inicio de sesión y sin nada que instalar. [[#portal #encryption]]
**Qué mitad de la dirección ve el servidor.** El identificador del recurso compartido está en la ruta y la clave que lo abre está después del \`#\`, que los navegadores nunca envían en una solicitud. El servidor responde con texto cifrado que no puede leer, y la página retira la clave de la barra de direcciones una vez usada, de modo que la clave no está en la entrada del historial ni en una dirección que quien lee reenvíe. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata el sellado. [[#keys #server-holds]]
**Por qué esa clave solo abre este mensaje.** La clave es un valor aleatorio nuevo creado solo para este recurso compartido, ligado a su identificador para que el mismo texto cifrado no pueda reutilizarse bajo otro, y sin relación con ninguna credencial de portal o de cuenta que quien lee pueda tener también. Abrir un enlace compartido no conecta la solicitud con ninguna otra conversación. [[#encryption #privacy]]
**Lo que se le puede decir a quien lee en lugar del contenido.** Un enlace que llega cortado o dañado se informa como enlace incompleto y no como un fallo, que es el problema real más probable porque estos enlaces viajan por mensaje de texto y un mensaje se puede partir. Los demás estados finales los trata [Acceso de un solo uso](#client-share/one-time). [[#failure-states #telephony]]
**Lo que ya no se puede retirar una vez descifrado el mensaje.** El texto descifrado es una cadena corriente en la memoria del dispositivo, que no se puede borrar como se borra una clave. La salida rápida suelta la referencia que la página tenía y navega a otro sitio, y una captura de pantalla, una copia o una página impresa se quedan donde quien lee las puso. [Salida rápida](#client-portal/quick-exit) trata lo que ese control alcanza y lo que no. [[#failure-states #privacy]]
**Con qué frecuencia se puede pedir un recurso compartido.** Las solicitudes de apertura están limitadas por dirección y por minuto, a diez, lo que acota un barrido de identificadores adivinados sin estorbar a quien abre un enlace. [[#failure-states]]
**La página de lectura y la clave del recurso.** La página es \`packages/client/src/routes/(client)/share/[id]/+page.svelte\` y el par de sellado es \`encryptShare\` y \`decryptShare\`, en \`packages/client/src/lib/portal/share-crypto.ts\`, que corre en el hilo principal porque la página no tiene sesión ni worker. El lado del servidor es \`openShare\`, en \`packages/server/src/portal/share-service.ts\`, contra la fila de \`091_share_links.ts\`. [Enlace compartido](#ticket-detail/share-link) trata el otro extremo. [[#encryption #server-holds]]`)
};

const en_xa2_demo_narrative_client_share_view_body = /** @type {(inputs: Demo_Narrative_Client_Share_View_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn sòmèònè òpèns à shàrè lìnk, thè pàgè fètchès thè èncryptèd còntènt fròm thè sèrvèr ànd dècrypts ìt ìn thè bròwsèr.
 ••••••••••••••••••••••••••••••••••••**Hòw thè lìnk wòrks. ••••••** Thè shàrè ÌD ìs ìn thè ÙRL pàth, ànd thè dècryptìòn kèy ìs ìn thè ÙRL fràgmènt, whìch thè bròwsèr nèvèr sènds tò thè sèrvèr. Thè sèrvèr sènds thè èncryptèd còntènt wìthòùt bèìng àblè tò rèàd ìt. Àftèr thè pàgè rèàds thè fràgmènt ìt strìps thè kèy fròm thè àddrèss bàr sò ìt dòès nòt pèrsìst ìn bròwsèr hìstòry òr àppèàr ìf thè ÙRL ìs còpìèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sècùrìty tràdèòff. ••••••** Thè dècryptèd tèxt sìts ìn thè dèvìcè's mèmòry às à vàlùè thàt cànnòt bè rèlìàbly èràsèd thè wày àn èncryptìòn kèy càn. Qùìck èxìt dròps ìt ànd nàvìgàtès àwày, bùt ùnlìkè kèys thèrè ìs nò zèròìng stèp thàt gùàràntèès ìt ìs gònè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Opening a share link fetches one encrypted message from the server and decrypts it on the reader's own device, with no account, no sign-in and nothing to ins..." |
*
* @param {Demo_Narrative_Client_Share_View_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_view_body = /** @type {((inputs?: Demo_Narrative_Client_Share_View_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_View_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_view_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_share_view_body(inputs)
	return en_demo_narrative_client_share_view_body(inputs)
});