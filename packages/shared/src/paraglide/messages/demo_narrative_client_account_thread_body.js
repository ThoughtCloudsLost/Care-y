/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Account_Thread_BodyInputs */

const en_demo_narrative_client_account_thread_body = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An account gives the client a password-based way to reopen the same conversation on every visit. The encryption is the same as a secure link, and only the source of the private key differs, which the password supplies. [Message thread](#client-portal/thread) covers the timeline and [Reply composer](#client-portal/composer) covers the reply path. [[#portal #client-data #encryption]]
**What does an account not change?** The expiry schedule for the client's copies is the same whether access comes from an account or a link. [Message thread](#client-portal/thread) covers the expiry in full. [[#retention #portal]]
**What does the server store?** The server keeps a fingerprint of the username that cannot be read back, plus what it needs to check a sign-in. Neither the username nor the password is readable. The server can also see that an account exists for this client, when it was created, and when the client last visited. That metadata is how a server that cannot read the conversation knows a client returned. [The portal channel lifecycle](#deep-dive/portal-channel-lifecycle) covers the channel record. [[#server-holds #metadata]]
**Who can reset an account?** A user holding the Reset client login permission can reset a client's account. Resetting deletes the account and the client's message copies, revokes the channel, and returns the client to text and email. A client who has lost the password has no other route back into the conversation. [Portal access tier](#ticket-detail/portal-tier) covers the control. [[#permissions #failure-states]]
**The account tables and channel service.** The account record is a \`client_accounts\` row holding \`username_hash\`, \`salt\`, \`public_key\`, and \`auth_hash\`. The channel is a \`portal_channels\` row with a \`kind\` of \`account\` and plaintext columns for \`created_at\` and \`last_seen_at\`, so the messaging services operate on it without modification. The migration is \`092_client_accounts.ts\` and the service is \`packages/server/src/portal/account-service.ts\`. [[#portal #server-holds]]`)
};

const es_demo_narrative_client_account_thread_body = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una cuenta ofrece al cliente una forma basada en contraseña de reabrir la misma conversación en cada visita. El cifrado es el mismo que el de un enlace seguro, y solo difiere el origen de la clave privada, que aquí proviene de la contraseña. [Hilo de mensajes](#client-portal/thread) trata la línea temporal y [Compositor de respuesta](#client-portal/composer) trata la ruta de respuesta. [[#portal #client-data #encryption]]
**¿Qué no cambia con una cuenta?** El calendario de caducidad de las copias del cliente es el mismo tanto si el acceso es por cuenta como por enlace. [Hilo de mensajes](#client-portal/thread) trata la caducidad en detalle. [[#retention #portal]]
**¿Qué almacena el servidor?** El servidor guarda una huella del nombre de usuario que no se puede leer a la inversa, más lo necesario para verificar un inicio de sesión. Ni el nombre de usuario ni la contraseña son legibles. El servidor también puede ver que existe una cuenta para este cliente, cuándo se creó y cuándo fue la última visita. Esos metadatos son lo que permite a un servidor incapaz de leer la conversación saber que el cliente volvió. [El ciclo de vida del canal del portal](#deep-dive/portal-channel-lifecycle) trata el registro del canal. [[#server-holds #metadata]]
**¿Quién puede restablecer una cuenta?** La persona usuaria con el permiso Restablecer acceso del cliente puede restablecer la cuenta de un cliente. El restablecimiento elimina la cuenta y las copias de mensajes del cliente, revoca el canal y lo regresa a texto y correo electrónico. Si el cliente ha perdido la contraseña, no existe otra vía para volver a la conversación. [Nivel de acceso al portal](#ticket-detail/portal-tier) trata el control. [[#permissions #failure-states]]
**Las tablas de cuenta y el servicio de canal.** El registro de cuenta es una fila de \`client_accounts\` con \`username_hash\`, \`salt\`, \`public_key\` y \`auth_hash\`. El canal es una fila de \`portal_channels\` con un \`kind\` de \`account\` y columnas en texto plano para \`created_at\` y \`last_seen_at\`, así que los servicios de mensajería operan sobre él sin modificación. La migración es \`092_client_accounts.ts\` y el servicio es \`packages/server/src/portal/account-service.ts\`. [[#portal #server-holds]]`)
};

const en_xa2_demo_narrative_client_account_thread_body = /** @type {(inputs: Demo_Narrative_Client_Account_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àccòùnt gìvès thè clìènt à pàsswòrd-bàsèd wày tò rèòpèn thè sàmè cònvèrsàtìòn òn èvèry vìsìt. Thè èncryptìòn ìs thè sàmè às à sècùrè lìnk, ànd ònly thè sòùrcè òf thè prìvàtè kèy dìffèrs, whìch thè pàsswòrd sùpplìès. [Mèssàgè thrèàd](#clìènt-pòrtàl/thrèàd) còvèrs thè tìmèlìnè ànd [Rèply còmpòsèr](#clìènt-pòrtàl/còmpòsèr) còvèrs thè rèply pàth. [[#pòrtàl #clìènt-dàtà #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès àn àccòùnt nòt chàngè? ••••••••••** Thè èxpìry schèdùlè fòr thè clìènt's còpìès ìs thè sàmè whèthèr àccèss còmès fròm àn àccòùnt òr à lìnk. [Mèssàgè thrèàd](#clìènt-pòrtàl/thrèàd) còvèrs thè èxpìry ìn fùll. [[#rètèntìòn #pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr stòrè? •••••••••** Thè sèrvèr kèèps à fìngèrprìnt òf thè ùsèrnàmè thàt cànnòt bè rèàd bàck, plùs whàt ìt nèèds tò chèck à sìgn-ìn. Nèìthèr thè ùsèrnàmè nòr thè pàsswòrd ìs rèàdàblè. Thè sèrvèr càn àlsò sèè thàt àn àccòùnt èxìsts fòr thìs clìènt, whèn ìt wàs crèàtèd, ànd whèn thè clìènt làst vìsìtèd. Thàt mètàdàtà ìs hòw à sèrvèr thàt cànnòt rèàd thè cònvèrsàtìòn knòws à clìènt rètùrnèd. [Thè pòrtàl chànnèl lìfècyclè](#dèèp-dìvè/pòrtàl-chànnèl-lìfècyclè) còvèrs thè chànnèl rècòrd. [[#sèrvèr-hòlds #mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whò càn rèsèt àn àccòùnt? ••••••••** À ùsèr hòldìng thè Rèsèt clìènt lògìn pèrmìssìòn càn rèsèt à clìènt's àccòùnt. Rèsèttìng dèlètès thè àccòùnt ànd thè clìènt's mèssàgè còpìès, rèvòkès thè chànnèl, ànd rètùrns thè clìènt tò tèxt ànd èmàìl. À clìènt whò hàs lòst thè pàsswòrd hàs nò òthèr ròùtè bàck ìntò thè cònvèrsàtìòn. [Pòrtàl àccèss tìèr](#tìckèt-dètàìl/pòrtàl-tìèr) còvèrs thè còntròl. [[#pèrmìssìòns #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè àccòùnt tàblès ànd chànnèl sèrvìcè. ••••••••••••** Thè àccòùnt rècòrd ìs à \`clìènt_àccòùnts\` ròw hòldìng \`ùsèrnàmè_hàsh\`, \`sàlt\`, \`pùblìc_kèy\`, ànd \`àùth_hàsh\`. Thè chànnèl ìs à \`pòrtàl_chànnèls\` ròw wìth à \`kìnd\` òf \`àccòùnt\` ànd plàìntèxt còlùmns fòr \`crèàtèd_àt\` ànd \`làst_sèèn_àt\`, sò thè mèssàgìng sèrvìcès òpèràtè òn ìt wìthòùt mòdìfìcàtìòn. Thè mìgràtìòn ìs \`092_clìènt_àccòùnts.ts\` ànd thè sèrvìcè ìs \`pàckàgès/sèrvèr/src/pòrtàl/àccòùnt-sèrvìcè.ts\`. [[#pòrtàl #sèrvèr-hòlds]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An account gives the client a password-based way to reopen the same conversation on every visit. The encryption is the same as a secure link, and only the so..." |
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