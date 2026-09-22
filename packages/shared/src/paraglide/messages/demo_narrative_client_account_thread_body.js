/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Thread_BodyInputs */

const en_demo_narrative_client_account_thread_body = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An account returns the client to the same conversation on every visit, so closing the browser and coming back days later needs a password rather than a link that has to be found again. [[#portal #client-data]]
**The same thread under a different credential.** The account renders the same timeline and the same composer as a secure link, and the encryption matches: each message sealed to the channel key, each file under a key of its own sealed to the same place, each reply sealed twice so both sides can read it. What changes is where the private key comes from, which here is the password. [Message thread](#client-portal/thread) covers the timeline and [Reply composer](#client-portal/composer) covers the reply. [[#encryption #keys]]
**What durable does not mean.** The client's copies of messages, files and recordings still drop after thirty days without a visit, so an account keeps access rather than keeping a transcript. The organization's record of the case is stored separately under the case key and outlives the client's copy on its own schedule. [Data retention](#deep-dive/data-retention) covers both. [[#retention #portal]]
**What the account row holds.** A keyed hash of the username, a salt, a public key and a hash of the bearer token, with no name and no password in any readable form. The channel row beside it is plaintext and shows that this client has an account, when it was created and when it was last opened, which is how a server that cannot read a conversation still knows a client came back. [Portal and channel lifecycle](#deep-dive/portal-channel-lifecycle) covers the channel row in full. [[#server-holds #metadata]]
**Who can end it from the other side.** An account can be reset by someone in the organization holding the permission to do that, which deletes the account and the client's copies and drops the client back to text and email. That is the only route back into a conversation for a client who has lost the password. [Communication tier](#ticket-detail/portal-tier) covers the control. [[#permissions #failure-states]]
**Where the account channel lives.** Account channels are ordinary \`portal_channels\` rows with a kind of \`account\`, so the messaging services work on them unchanged; the account row and its sessions come from \`092_client_accounts.ts\` and the service is \`packages/server/src/portal/account-service.ts\`. [[#portal #server-holds]]`)
};

const es_demo_narrative_client_account_thread_body = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una cuenta devuelve al cliente a la misma conversación en cada visita, de modo que cerrar el navegador y volver días después requiere una contraseña y no un enlace que haya que encontrar otra vez. [[#portal #client-data]]
**El mismo hilo con otra credencial.** La cuenta presenta la misma línea temporal y el mismo compositor que un enlace seguro, y el cifrado coincide: cada mensaje sellado con la clave del canal, cada archivo bajo una clave propia sellada en el mismo sitio y cada respuesta sellada dos veces para que ambas partes puedan leerla. Lo que cambia es de dónde sale la clave privada, que aquí es la contraseña. [Hilo de mensajes](#client-portal/thread) trata la línea temporal y [Compositor de respuesta](#client-portal/composer) trata la respuesta. [[#encryption #keys]]
**Lo que no significa duradero.** Las copias de mensajes, archivos y grabaciones que tiene el cliente siguen eliminándose tras treinta días sin visita, así que una cuenta conserva el acceso y no una transcripción. El registro del caso que guarda la organización se almacena aparte bajo la clave del caso y sobrevive a la copia del cliente con su propio calendario. [Retención de datos](#deep-dive/data-retention) trata ambos. [[#retention #portal]]
**Lo que guarda la fila de la cuenta.** Un hash con clave del nombre de usuario, una sal, una clave pública y un hash del testigo de acceso, sin nombre ni contraseña en ninguna forma legible. La fila del canal que la acompaña está en texto plano y muestra que este cliente tiene una cuenta, cuándo se creó y cuándo se abrió por última vez, que es como un servidor incapaz de leer una conversación sabe aun así que un cliente ha vuelto. [El ciclo de vida del portal y los canales](#deep-dive/portal-channel-lifecycle) trata la fila del canal al completo. [[#server-holds #metadata]]
**Quién puede terminarla desde el otro lado.** Una cuenta la puede restablecer alguien de la organización con el permiso correspondiente, lo que elimina la cuenta y las copias del cliente y devuelve al cliente a texto y correo. Esa es la única vía de regreso a una conversación para un cliente que ha perdido la contraseña. [Nivel de comunicación](#ticket-detail/portal-tier) trata ese control. [[#permissions #failure-states]]
**Dónde vive el canal de la cuenta.** Los canales de cuenta son filas normales de \`portal_channels\` con el tipo \`account\`, así que los servicios de mensajería funcionan sobre ellas sin cambios; la fila de la cuenta y sus sesiones vienen de \`092_client_accounts.ts\` y el servicio es \`packages/server/src/portal/account-service.ts\`. [[#portal #server-holds]]`)
};

const en_xa2_demo_narrative_client_account_thread_body = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àftèr sìgnìng ìn, thè àccòùnt pàgè shòws thè sàmè mèssàgè thrèàd ànd còmpòsèr às thè sècùrè lìnk pòrtàl, ànd thè clìènt càn clòsè thè bròwsèr, rètùrn làtèr, sìgn ìn àgàìn, ànd rèsùmè thè cònvèrsàtìòn whèrè ìt lèft òff.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè àccòùnt thrèàd dèrìvès dècryptìòn kèys fròm thè pàsswòrd ràthèr thàn thè ÙRL fràgmènt, bùt thè èncryptìòn ànd rèply lìfècyclè àrè òthèrwìsè ìdèntìcàl tò thè sècùrè lìnk pòrtàl. À frèsh clìènt rèply ìs rèàdàblè by àny ùsèr whò hòlds thè òrgànìzàtìòn kèy ùntìl thè fìrst ùsèr òpèns ìt, àftèr whìch ònly hòldèrs òf pèr tìckèt kèy wràps càn rèàd ìt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrsìstèncè. ••••** Thè clìènt's mèssàgè còpìès òn thè pòrtàl chànnèl àrè dròppèd àftèr 30 dàys òf chànnèl ìnàctìvìty, whìlè thè òrgànìzàtìòn's òwn rècòrd òf thè cònvèrsàtìòn ìs stòrèd sèpàràtèly ùndèr thè pèr tìckèt kèy ànd fòllòws ìts òwn rètèntìòn rùlès. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An account returns the client to the same conversation on every visit, so closing the browser and coming back days later needs a password rather than a link ..." |
*
* @param {Demo_Narrative_Client_Account_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_thread_body = /** @type {((inputs?: Demo_Narrative_Client_Account_Thread_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Account_Thread_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_account_thread_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_account_thread_body(inputs)
	return en_demo_narrative_client_account_thread_body(inputs)
});