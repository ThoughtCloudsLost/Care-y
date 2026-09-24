/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Credentials_BodyInputs */

const en_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Signing in takes a username and a password. The username is a login identifier rather than an email address, set when the account is created. One copy of the password goes to the server to confirm identity, and a second copy stays in the browser as the input to the key derivation that opens the organization's encrypted data. [[#keys #privacy]]
**What the server keeps of a password.** A scrypt hash in the account row, which can confirm a password and cannot reveal one. The derivation that produces encryption keys runs on a path the server has no say in, because its cost parameters are fixed in the browser's own code and a value the server suggests can only raise them. A compromised server cannot make offline guessing cheaper than the browser already allows. [How keys are derived](#deep-dive/how-keys-are-derived) covers what the browser does with the second copy. [[#server-holds #keys]]
**What the server keeps of a username.** The users table has no plaintext identifier column. It holds a blind index hash for lookup and a sealed copy the browser opens, so an account can be found by its identifier without the server being able to read one. A request for an unknown username is answered with a deterministic fake salt derived from a server secret, so the reply does not separate a real account from an absent one. [[#server-holds #metadata]]
**Keys that do not outlive the tab.** The keys the password produces exist in the crypto worker's memory for the length of the session and are zeroed when it ends. Nothing derived from the password is written to disk or sent anywhere, so a seized server holds no key material at all. [[#encryption #keys]]
**When a password is lost.** There is no reset link and no recovery question. An administrator chooses the first password when creating an account and has no route to read or replace it afterward, and changing a password requires the current one. The cases that account could open stay readable to everyone else, because each case key is wrapped separately for each account rather than shared once for the whole organization. [[#failure-states #keys]]
**Where the two paths split.** The browser side is \`packages/client/src/lib/auth/login-crypto.ts\` with the parameter floor in \`enforceArgon2Floor\` in \`packages/crypto/src/derive.ts\`. The server side is \`packages/server/src/auth/service.ts\` and \`packages/server/src/auth/password.ts\`, with the enumeration defense in \`packages/server/src/auth/salt-defense.ts\`. A password change runs through \`packages/server/src/routes/profile.ts\` and \`packages/client/src/lib/settings/password-change.ts\`. [[#keys #server-holds]]`)
};

const es_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iniciar sesión requiere un nombre de usuario y una contraseña. El nombre de usuario es un identificador de acceso y no una dirección de correo, y se fija al crear la cuenta. Una copia de la contraseña va al servidor para confirmar la identidad, y otra copia se queda en el navegador como entrada de la derivación de claves que abre los datos cifrados de la organización. [[#keys #privacy]]
**Lo que el servidor guarda de una contraseña.** Un hash scrypt en la fila de la cuenta, que puede confirmar una contraseña y no puede revelarla. La derivación que produce las claves de cifrado corre por una ruta en la que el servidor no interviene, porque sus parámetros de coste están fijados en el código del propio navegador y un valor que proponga el servidor solo puede subirlos. Un servidor comprometido no puede abaratar un ataque de fuerza bruta por debajo de lo que ya permite el navegador. [Cómo se derivan las claves](#deep-dive/how-keys-are-derived) trata lo que el navegador hace con la segunda copia. [[#server-holds #keys]]
**Lo que el servidor guarda de un nombre de usuario.** La tabla de cuentas no tiene ninguna columna con el identificador en claro. Guarda un hash de índice ciego para la búsqueda y una copia sellada que abre el navegador, así que se puede localizar una cuenta por su identificador sin que el servidor pueda leer ninguno. Una petición con un nombre de usuario inexistente se responde con una sal falsa determinista derivada de un secreto del servidor, de modo que la respuesta no distingue una cuenta real de una ausente. [[#server-holds #metadata]]
**Claves que no sobreviven a la pestaña.** Las claves que produce la contraseña existen en la memoria del worker criptográfico mientras dura la sesión y se ponen a cero al terminar. Nada derivado de la contraseña se escribe en disco ni se envía a ninguna parte, así que un servidor incautado no contiene material de claves. [[#encryption #keys]]
**Cuando se pierde una contraseña.** No hay enlace de restablecimiento ni pregunta de recuperación. La persona administradora elige la primera contraseña al crear la cuenta y después no tiene ninguna vía para leerla ni sustituirla, y cambiar una contraseña exige la actual. Los casos que esa cuenta podía abrir siguen siendo legibles para las demás, porque la clave de cada caso se envuelve por separado para cada cuenta y no una sola vez para toda la organización. [[#failure-states #keys]]
**Dónde se separan las dos rutas.** El lado del navegador es \`packages/client/src/lib/auth/login-crypto.ts\`, con el mínimo de parámetros en \`enforceArgon2Floor\`, en \`packages/crypto/src/derive.ts\`. El lado del servidor es \`packages/server/src/auth/service.ts\` y \`packages/server/src/auth/password.ts\`, con la defensa contra enumeración en \`packages/server/src/auth/salt-defense.ts\`. Un cambio de contraseña pasa por \`packages/server/src/routes/profile.ts\` y \`packages/client/src/lib/settings/password-change.ts\`. [[#keys #server-holds]]`)
};

const en_xa2_demo_narrative_topic_credentials_body = /** @type {(inputs: Demo_Narrative_Topic_Credentials_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgn-ìn rèqùìrès à ùsèrnàmè ànd pàsswòrd. Thè ùsèrnàmè ìs à lògìn ìdèntìfìèr, nòt àn èmàìl àddrèss, chòsèn àt àccòùnt crèàtìòn by thè ùsèr òr àn àdmìn.
 ••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Thè pàsswòrd sèrvès twò pùrpòsès. Ònè còpy ìs chèckèd àgàìnst thè sèrvèr tò cònfìrm ìdèntìty. Thè sèrvèr stòrès ònly à ònè-wày hàsh, nèvèr thè pàsswòrd ìtsèlf. À sèpàràtè còpy stàys ìn thè bròwsèr ànd fèèds à kèy-dèrìvàtìòn pròcèss thàt ùnlòcks thè òrgànìzàtìòn's èncryptèd dàtà. Thè sèrvèr nèvèr sèès thìs sècònd còpy ànd cànnòt ìnflùèncè hòw ìt wòrks. Thè dèrìvàtìòn pàràmètèrs àrè fìxèd ìn thè bròwsèr's còdè, sò à còmpròmìsèd sèrvèr cànnòt wèàkèn thèm.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè èncryptìòn kèys pròdùcèd fròm thè pàsswòrd èxìst ònly ìn bròwsèr mèmòry. Thèy àrè èràsèd whèn thè tàb clòsès. Thèy àrè nèvèr stòrèd òn thè sèrvèr, nèvèr wrìttèn tò dìsk, ànd nèvèr trànsmìttèd. Ìf sòmèònè gàìns àccèss tò thè sèrvèr, thèrè àrè nò kèys tò fìnd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìf ìt fàìls. ••••** Thèrè ìs nò pàsswòrd rèsèt ànd nò rècòvèry lìnk. Àdmìns cànnòt sèt òr sèè ànòthèr àccòùnt's pàsswòrd. À lòst pàsswòrd mèàns thè àccòùnt ìs gònè, bùt càsès àrè ùnàffèctèd bècàùsè èàch càsè kèy ìs wràppèd ìndìvìdùàlly pèr ùsèr. Èvèryònè èlsè kèèps àccèss tò thè sàmè dàtà. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Signing in takes a username and a password. The username is a login identifier rather than an email address, set when the account is created. One copy of the..." |
*
* @param {Demo_Narrative_Topic_Credentials_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_credentials_body = /** @type {((inputs?: Demo_Narrative_Topic_Credentials_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Credentials_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_credentials_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_credentials_body(inputs)
	return en_demo_narrative_topic_credentials_body(inputs)
});