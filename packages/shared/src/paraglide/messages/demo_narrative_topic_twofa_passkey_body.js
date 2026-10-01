/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Passkey_BodyInputs */

const en_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A passkey turns the device itself into the second factor. No one-time code leaves the device, and no secret crosses the network. [[#keys #privacy]]
**Platform and roaming credentials.** A passkey is either a platform credential or a roaming credential. A platform credential is unlocked with a fingerprint, face scan, or PIN. A roaming credential is a separate physical security key that plugs into the device or is held against a phone. A roaming credential's private key stays on the physical key. A platform credential's private key stays on the device unless the platform vendor syncs it to a cloud keychain, which the product records and labels as synced. The server receives only the public key, which cannot produce a signature on its own. A passkey cannot be captured by a fake site because the browser ties each signature to the real site's address. A passkey that is not backed up is lost when the device is lost. [[#keys #encryption]]
**Sign-in challenge.** The server issues a single-use challenge and holds it on the pending session. The device signs the challenge together with the requesting origin. The server checks that the credential belongs to the signing-in user and rejects a user handle naming anyone else. It then checks the signature, the origin, and the relying party identifier against expected values and clears the challenge so it cannot answer twice. A phishing site that coaxes the credential into signing receives a signature over its own origin, which fails the server's relying party check. [[#encryption #failure-states]]
**Stored credential fields.** The server stores each credential as plaintext fields:
- The credential identifier and the public key.
- The signing algorithm (ES256 or RS256).
- The authenticator's use counter and advertised transports.
- The platform-or-roaming type and whether the device reports the credential as backed up.
- The authenticator model identifier.
A database dump reveals how many passkeys an account has and roughly what hardware they use. The use counter is compared on every sign-in. A mismatch exposes a cloned authenticator. [[#server-holds #metadata]]
**Domain scope.** The passkey is scoped to the domain, not to an individual organization's subdomain. On the hosted deployment, a passkey works across every organization hosted on the domain. On a self-hosted instance the same scoping applies to its one organization on its own domain. A passkey survives an organization renaming its slug. A volunteer who works with several organizations on the hosted deployment can use one passkey for all of them. The browser validates the exact subdomain at each sign-in. Using one passkey across organizations does not weaken login security because the password salt is still looked up per organization. [Deployment](#deep-dive/deployment) covers the two deployment types. [[#trust-boundary #keys]]
**WebAuthn verification code.** Challenge issue, assertion checks, and counter updates are in \`packages/server/src/auth/two-factor-service.ts\`, against the vendored verifier in \`packages/server/src/auth/webauthn/verify.ts\`. The browser side is \`packages/client/src/lib/webauthn.ts\`. The credential row is \`webauthn_credentials\`, defined in \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. [[#keys #server-holds]]`)
};

const es_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una passkey convierte al propio dispositivo en el segundo factor. Ningún código de un solo uso sale del dispositivo, y ningún secreto cruza la red. [[#keys #privacy]]
**Credenciales de plataforma y externas.** Una passkey es una credencial de plataforma o una credencial externa. Una credencial de plataforma se desbloquea con huella dactilar, reconocimiento facial o PIN. Una credencial externa es una llave de seguridad física independiente que se conecta al dispositivo o se acerca a un teléfono. La clave privada de una credencial externa permanece en la llave física. La clave privada de una credencial de plataforma permanece en el dispositivo a menos que el proveedor de la plataforma la sincronice con un llavero en la nube; el producto registra y etiqueta esa credencial como sincronizada. El servidor recibe solo la clave pública, que no puede producir una firma por sí sola. Una passkey no puede ser capturada por un sitio falso porque el navegador vincula cada firma a la dirección del sitio real. Una passkey sin respaldo se pierde cuando se pierde el dispositivo. [[#keys #encryption]]
**Desafío de inicio de sesión.** El servidor emite un desafío de un solo uso y lo retiene en la sesión pendiente. El dispositivo firma el desafío junto con el origen solicitante. El servidor comprueba que la credencial pertenece al usuario que inicia sesión y rechaza un user handle que nombre a otra persona. Después verifica la firma, el origen y el identificador de la parte confiante contra los valores esperados e invalida el desafío para que no pueda responder dos veces. Un sitio de phishing que logra que la credencial firme recibe una firma sobre su propio origen, lo que no supera la verificación de la parte confiante del servidor. [[#encryption #failure-states]]
**Campos almacenados de la credencial.** El servidor almacena cada credencial como campos en texto plano:
- El identificador de credencial y la clave pública.
- El algoritmo de firma (ES256 o RS256).
- El contador de uso del autenticador y los transportes anunciados.
- El tipo plataforma o externo y si el dispositivo informa que la credencial está respaldada.
- El identificador de modelo del autenticador.
Un volcado de la base de datos revela cuántas passkeys tiene una cuenta y aproximadamente qué hardware utilizan. El contador de uso se compara en cada inicio de sesión. Una discrepancia expone un autenticador clonado. [[#server-holds #metadata]]
**Alcance del dominio.** La passkey está vinculada al dominio, no al subdominio de una organización individual. En el despliegue alojado, una passkey funciona en todas las organizaciones alojadas en el dominio. En una instancia autoalojada, el mismo alcance aplica a su única organización en su propio dominio. Una passkey sobrevive al cambio de slug de una organización. Un voluntario que trabaja con varias organizaciones en el despliegue alojado puede usar una sola passkey para todas. El navegador valida el subdominio exacto en cada inicio de sesión. Usar una passkey en varias organizaciones no debilita la seguridad del inicio de sesión porque la sal de la contraseña se sigue buscando por organización. [Despliegue](#deep-dive/deployment) trata los dos tipos de despliegue. [[#trust-boundary #keys]]
**Código de verificación WebAuthn.** La emisión del desafío, las verificaciones de aserción y las actualizaciones del contador están en \`packages/server/src/auth/two-factor-service.ts\`, contra el verificador incluido en \`packages/server/src/auth/webauthn/verify.ts\`. El lado del navegador es \`packages/client/src/lib/webauthn.ts\`. La fila de credencial es \`webauthn_credentials\`, definida en \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. [[#keys #server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_passkey_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À pàsskèy tùrns thè dèvìcè ìtsèlf ìntò thè sècònd fàctòr. Nò ònè-tìmè còdè lèàvès thè dèvìcè, ànd nò sècrèt cròssès thè nètwòrk. [[#kèys #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••**Plàtfòrm ànd ròàmìng crèdèntìàls. ••••••••••** À pàsskèy ìs èìthèr à plàtfòrm crèdèntìàl òr à ròàmìng crèdèntìàl. À plàtfòrm crèdèntìàl ìs ùnlòckèd wìth à fìngèrprìnt, fàcè scàn, òr PÌN. À ròàmìng crèdèntìàl ìs à sèpàràtè physìcàl sècùrìty kèy thàt plùgs ìntò thè dèvìcè òr ìs hèld àgàìnst à phònè. À ròàmìng crèdèntìàl's prìvàtè kèy stàys òn thè physìcàl kèy. À plàtfòrm crèdèntìàl's prìvàtè kèy stàys òn thè dèvìcè ùnlèss thè plàtfòrm vèndòr syncs ìt tò à clòùd kèychàìn, whìch thè pròdùct rècòrds ànd làbèls às syncèd. Thè sèrvèr rècèìvès ònly thè pùblìc kèy, whìch cànnòt pròdùcè à sìgnàtùrè òn ìts òwn. À pàsskèy cànnòt bè càptùrèd by à fàkè sìtè bècàùsè thè bròwsèr tìès èàch sìgnàtùrè tò thè rèàl sìtè's àddrèss. À pàsskèy thàt ìs nòt bàckèd ùp ìs lòst whèn thè dèvìcè ìs lòst. [[#kèys #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Sìgn-ìn chàllèngè. ••••••** Thè sèrvèr ìssùès à sìnglè-ùsè chàllèngè ànd hòlds ìt òn thè pèndìng sèssìòn. Thè dèvìcè sìgns thè chàllèngè tògèthèr wìth thè rèqùèstìng òrìgìn. Thè sèrvèr chècks thàt thè crèdèntìàl bèlòngs tò thè sìgnìng-ìn ùsèr ànd rèjècts à ùsèr hàndlè nàmìng ànyònè èlsè. Ìt thèn chècks thè sìgnàtùrè, thè òrìgìn, ànd thè rèlyìng pàrty ìdèntìfìèr àgàìnst èxpèctèd vàlùès ànd clèàrs thè chàllèngè sò ìt cànnòt ànswèr twìcè. À phìshìng sìtè thàt còàxès thè crèdèntìàl ìntò sìgnìng rècèìvès à sìgnàtùrè òvèr ìts òwn òrìgìn, whìch fàìls thè sèrvèr's rèlyìng pàrty chèck. [[#èncryptìòn #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Stòrèd crèdèntìàl fìèlds. ••••••••** Thè sèrvèr stòrès èàch crèdèntìàl às plàìntèxt fìèlds:
- Thè crèdèntìàl ìdèntìfìèr ànd thè pùblìc kèy.
- Thè sìgnìng àlgòrìthm (ÈS256 òr RS256).
- Thè àùthèntìcàtòr's ùsè còùntèr ànd àdvèrtìsèd trànspòrts.
- Thè plàtfòrm-òr-ròàmìng typè ànd whèthèr thè dèvìcè rèpòrts thè crèdèntìàl às bàckèd ùp.
- Thè àùthèntìcàtòr mòdèl ìdèntìfìèr.
À dàtàbàsè dùmp rèvèàls hòw màny pàsskèys àn àccòùnt hàs ànd ròùghly whàt hàrdwàrè thèy ùsè. Thè ùsè còùntèr ìs còmpàrèd òn èvèry sìgn-ìn. À mìsmàtch èxpòsès à clònèd àùthèntìcàtòr. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Dòmàìn scòpè. ••••** Thè pàsskèy ìs scòpèd tò thè dòmàìn, nòt tò àn ìndìvìdùàl òrgànìzàtìòn's sùbdòmàìn. Òn thè hòstèd dèplòymènt, à pàsskèy wòrks àcròss èvèry òrgànìzàtìòn hòstèd òn thè dòmàìn. Òn à sèlf-hòstèd ìnstàncè thè sàmè scòpìng àpplìès tò ìts ònè òrgànìzàtìòn òn ìts òwn dòmàìn. À pàsskèy sùrvìvès àn òrgànìzàtìòn rènàmìng ìts slùg. À vòlùntèèr whò wòrks wìth sèvèràl òrgànìzàtìòns òn thè hòstèd dèplòymènt càn ùsè ònè pàsskèy fòr àll òf thèm. Thè bròwsèr vàlìdàtès thè èxàct sùbdòmàìn àt èàch sìgn-ìn. Ùsìng ònè pàsskèy àcròss òrgànìzàtìòns dòès nòt wèàkèn lògìn sècùrìty bècàùsè thè pàsswòrd sàlt ìs stìll lòòkèd ùp pèr òrgànìzàtìòn. [Dèplòymènt](#dèèp-dìvè/dèplòymènt) còvèrs thè twò dèplòymènt typès. [[#trùst-bòùndàry #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**WèbÀùthn vèrìfìcàtìòn còdè. •••••••••** Chàllèngè ìssùè, àssèrtìòn chècks, ànd còùntèr ùpdàtès àrè ìn \`pàckàgès/sèrvèr/src/àùth/twò-fàctòr-sèrvìcè.ts\`, àgàìnst thè vèndòrèd vèrìfìèr ìn \`pàckàgès/sèrvèr/src/àùth/wèbàùthn/vèrìfy.ts\`. Thè bròwsèr sìdè ìs \`pàckàgès/clìènt/src/lìb/wèbàùthn.ts\`. Thè crèdèntìàl ròw ìs \`wèbàùthn_crèdèntìàls\`, dèfìnèd ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\`. [[#kèys #sèrvèr-hòlds]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A passkey turns the device itself into the second factor. No one-time code leaves the device, and no secret crosses the network. [[#keys #privacy]] **Platfor..." |
*
* @param {Demo_Narrative_Topic_Twofa_Passkey_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_passkey_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_passkey_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_passkey_body(inputs)
	return en_demo_narrative_topic_twofa_passkey_body(inputs)
});