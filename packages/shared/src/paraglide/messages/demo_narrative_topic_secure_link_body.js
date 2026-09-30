/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Secure_Link_BodyInputs */

const en_demo_narrative_topic_secure_link_body = /** @type {(inputs: Demo_Narrative_Topic_Secure_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Setting up a secure link creates a private page for one client, reachable only by the exact address the signed-in user hands over. [[#portal #keys]]
**What does the browser generate and what does the server receive?** The browser draws a 24-byte random seed and derives from it:
- The channel identifier, used to address the client's page on the server
- A bearer token that the client's page sends with every server call to prove it holds the address
- A salt for the key-derivation step
The seed, or the seed concatenated with the Argon2id stretch of a spoken passphrase, goes through a key evaluation round; the result derives the client's keypair. The server receives:
- The channel identifier
- A BLAKE2b hash of the bearer token
- The client's public key
- A small ciphertext that lets the page check whether the visitor typed the right passphrase without asking the server
The seed stays in the URL fragment, after the \`#\`. Browsers never include the fragment in requests to the server. [How keys are derived](#deep-dive/how-keys-are-derived) covers the evaluation round. [[#keys #encryption #server-holds]]
**Passphrase.** The passphrase is five words drawn from the EFF word list, sampled uniformly. It is meant to be spoken on a call and written down nowhere. The passphrase and the finished address never appear in the same setup step. A photograph of one cannot reconstruct the other. Before stretching, the passphrase is normalized (NFKC, casefold, whitespace collapse). Different casing, spacing, or Unicode form derives the same key. [[#keys #privacy #portal]]
**Handing the address over.** The address can be copied or sent as a text through the organization's own line. The text route is rate limited and reports how long to wait. Setup offers to re-seal every ticket belonging to that client under the new channel key; the re-seal walks tickets in chunks and reports how many items it could not convert. Closing the sheet zeroes the seed, the bearer token, and the private key in memory. Cancelling mid-run asks for confirmation first. [[#portal #failure-states #telephony]]
**The derivation and reseal modules.** \`packages/crypto/src/portal.ts\` holds the seed, channel, salt, and keypair derivations. The sheet is \`SecureLinkSheet.svelte\` and the re-seal walk is \`create-portal-reseed.svelte.ts\` in \`packages/client/src/lib/composables/tickets/\`. When a mutation fails, the sheet returns to its first step and shows one generic message. The error object in scope can carry key material, and the sheet discards it without displaying any detail. [The portal channel lifecycle](#deep-dive/portal-channel-lifecycle) covers the row the mutation writes. [[#keys #failure-states]]`)
};

const es_demo_narrative_topic_secure_link_body = /** @type {(inputs: Demo_Narrative_Topic_Secure_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar un enlace seguro crea una página privada para un cliente, accesible solo con la dirección exacta que la persona usuaria entrega. [[#portal #keys]]
**¿Qué genera el navegador y qué recibe el servidor?** El navegador genera una semilla aleatoria de 24 bytes y deriva de ella:
- El identificador de canal, usado para dirigirse a la página del cliente en el servidor
- Un token portador que la página del cliente envía con cada llamada al servidor para demostrar que posee la dirección
- Una sal para el paso de derivación de claves
La semilla, o la semilla concatenada con el estiramiento Argon2id de una frase de paso hablada, pasa por una ronda de evaluación de claves; el resultado deriva el par de claves del cliente. El servidor recibe:
- El identificador de canal
- Un hash BLAKE2b del token portador
- La clave pública del cliente
- Un pequeño texto cifrado que permite a la página comprobar si el visitante escribió la frase de paso correcta sin consultar al servidor
La semilla permanece en el fragmento de la URL, después del \`#\`. Los navegadores nunca incluyen el fragmento en las peticiones al servidor. [Cómo se derivan las claves](#deep-dive/how-keys-are-derived) explica cómo funciona la ronda de evaluación. [[#keys #encryption #server-holds]]
**Frase de paso.** La frase de paso consta de cinco palabras tomadas de la lista de palabras EFF, muestreadas uniformemente. Está pensada para ser dicha en una llamada y no escrita en ningún lugar. La frase de paso y la dirección completa nunca aparecen en el mismo paso de configuración. Una fotografía de cualquiera de ellas no basta para reconstruir la otra. Antes del estiramiento, la frase de paso se normaliza (NFKC, plegado de mayúsculas, colapso de espacios). Diferencias de mayúsculas, espaciado o forma Unicode derivan la misma clave. [[#keys #privacy #portal]]
**Entrega de la dirección.** La dirección se puede copiar o enviar como texto a través de la línea propia de la organización. La vía de texto tiene límite de frecuencia e informa cuánto tiempo hay que esperar. La configuración ofrece volver a sellar todos los tickets del cliente con la nueva clave de canal; el resellado recorre los tickets en bloques e informa cuántos elementos no se pudieron convertir. Al cerrar la hoja se ponen a cero la semilla, el token portador y la clave privada en memoria. Cancelar a mitad de ejecución pide confirmación primero. [[#portal #failure-states #telephony]]
**Los módulos de derivación y resellado.** \`packages/crypto/src/portal.ts\` contiene las derivaciones de semilla, canal, sal y par de claves. La hoja es \`SecureLinkSheet.svelte\` y el recorrido de resellado es \`create-portal-reseed.svelte.ts\` en \`packages/client/src/lib/composables/tickets/\`. Cuando una mutación falla, la hoja vuelve a su primer paso y muestra un único mensaje genérico. El objeto de error en contexto puede contener material de claves, y la hoja lo descarta sin mostrar ningún detalle. [El ciclo de vida del canal del portal](#deep-dive/portal-channel-lifecycle) trata la fila que la mutación escribe. [[#keys #failure-states]]`)
};

const en_xa2_demo_narrative_topic_secure_link_body = /** @type {(inputs: Demo_Narrative_Topic_Secure_Link_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèttìng ùp à sècùrè lìnk crèàtès à prìvàtè pàgè fòr ònè clìènt, rèàchàblè ònly by thè èxàct àddrèss thè sìgnèd-ìn ùsèr hànds òvèr. [[#pòrtàl #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè bròwsèr gènèràtè ànd whàt dòès thè sèrvèr rècèìvè? ••••••••••••••••••••** Thè bròwsèr dràws à 24-bytè ràndòm sèèd ànd dèrìvès fròm ìt:
- Thè chànnèl ìdèntìfìèr, ùsèd tò àddrèss thè clìènt's pàgè òn thè sèrvèr
- À bèàrèr tòkèn thàt thè clìènt's pàgè sènds wìth èvèry sèrvèr càll tò pròvè ìt hòlds thè àddrèss
- À sàlt fòr thè kèy-dèrìvàtìòn stèp
Thè sèèd, òr thè sèèd còncàtènàtèd wìth thè Àrgòn2ìd strètch òf à spòkèn pàssphràsè, gòès thròùgh à kèy èvàlùàtìòn ròùnd; thè rèsùlt dèrìvès thè clìènt's kèypàìr. Thè sèrvèr rècèìvès:
- Thè chànnèl ìdèntìfìèr
- À BLÀKÈ2b hàsh òf thè bèàrèr tòkèn
- Thè clìènt's pùblìc kèy
- À smàll cìphèrtèxt thàt lèts thè pàgè chèck whèthèr thè vìsìtòr typèd thè rìght pàssphràsè wìthòùt àskìng thè sèrvèr
Thè sèèd stàys ìn thè ÙRL fràgmènt, àftèr thè \`#\`. Bròwsèrs nèvèr ìnclùdè thè fràgmènt ìn rèqùèsts tò thè sèrvèr. [Hòw kèys àrè dèrìvèd](#dèèp-dìvè/hòw-kèys-àrè-dèrìvèd) còvèrs thè èvàlùàtìòn ròùnd. [[#kèys #èncryptìòn #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pàssphràsè. ••••** Thè pàssphràsè ìs fìvè wòrds dràwn fròm thè ÈFF wòrd lìst, sàmplèd ùnìfòrmly. Ìt ìs mèànt tò bè spòkèn òn à càll ànd wrìttèn dòwn nòwhèrè. Thè pàssphràsè ànd thè fìnìshèd àddrèss nèvèr àppèàr ìn thè sàmè sètùp stèp. À phòtògràph òf ònè cànnòt rècònstrùct thè òthèr. Bèfòrè strètchìng, thè pàssphràsè ìs nòrmàlìzèd (NFKC, càsèfòld, whìtèspàcè còllàpsè). Dìffèrènt càsìng, spàcìng, òr Ùnìcòdè fòrm dèrìvès thè sàmè kèy. [[#kèys #prìvàcy #pòrtàl]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hàndìng thè àddrèss òvèr. ••••••••** Thè àddrèss càn bè còpìèd òr sènt às à tèxt thròùgh thè òrgànìzàtìòn's òwn lìnè. Thè tèxt ròùtè ìs ràtè lìmìtèd ànd rèpòrts hòw lòng tò wàìt. Sètùp òffèrs tò rè-sèàl èvèry tìckèt bèlòngìng tò thàt clìènt ùndèr thè nèw chànnèl kèy; thè rè-sèàl wàlks tìckèts ìn chùnks ànd rèpòrts hòw màny ìtèms ìt còùld nòt cònvèrt. Clòsìng thè shèèt zèròès thè sèèd, thè bèàrèr tòkèn, ànd thè prìvàtè kèy ìn mèmòry. Càncèllìng mìd-rùn àsks fòr cònfìrmàtìòn fìrst. [[#pòrtàl #fàìlùrè-stàtès #tèlèphòny]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè dèrìvàtìòn ànd rèsèàl mòdùlès. •••••••••••** \`pàckàgès/cryptò/src/pòrtàl.ts\` hòlds thè sèèd, chànnèl, sàlt, ànd kèypàìr dèrìvàtìòns. Thè shèèt ìs \`SècùrèLìnkShèèt.svèltè\` ànd thè rè-sèàl wàlk ìs \`crèàtè-pòrtàl-rèsèèd.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèts/\`. Whèn à mùtàtìòn fàìls, thè shèèt rètùrns tò ìts fìrst stèp ànd shòws ònè gènèrìc mèssàgè. Thè èrròr òbjèct ìn scòpè càn càrry kèy màtèrìàl, ànd thè shèèt dìscàrds ìt wìthòùt dìsplàyìng àny dètàìl. [Thè pòrtàl chànnèl lìfècyclè](#dèèp-dìvè/pòrtàl-chànnèl-lìfècyclè) còvèrs thè ròw thè mùtàtìòn wrìtès. [[#kèys #fàìlùrè-stàtès]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Setting up a secure link creates a private page for one client, reachable only by the exact address the signed-in user hands over. [[#portal #keys]] **What d..." |
*
* @param {Demo_Narrative_Topic_Secure_Link_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_secure_link_body = /** @type {((inputs?: Demo_Narrative_Topic_Secure_Link_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Secure_Link_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_secure_link_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_secure_link_body(inputs)
	return en_demo_narrative_topic_secure_link_body(inputs)
});