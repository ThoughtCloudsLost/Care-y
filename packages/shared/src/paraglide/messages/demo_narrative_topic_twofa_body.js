/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_BodyInputs */

const en_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A correct password alone does not open case data. Every sign-in also asks for a second factor through a separate channel, and the browser starts deriving encryption keys only after that check passes, so an attacker holding the password alone never gets key material into the tab. [[#keys #encryption]]
**The methods.** Any number of them can be enrolled at once and each one works on its own. [[#privacy]]
- [Passkeys and security keys](#login/passkey) cover the device-bound options, which are the only ones an attacker cannot use from somewhere else. [[#keys]]
- [Authenticator app codes](#login/totp) cover the offline six-digit option. [[#privacy]]
- [Email codes](#login/email) and [Text message codes](#login/sms) cover the two delivered options and what the server has to be able to read for them. [[#server-holds #telephony]]
- [Push approval](#login/push) covers the prompt sent to an installed app. [[#privacy]]
- [Backup codes](#login/backup-codes) cover the one-time set generated alongside the first enrollment. [[#failure-states]]
**The last method.** A second factor cannot be turned off once it is on. Enrolling one is forced at the first sign-in on a new account and no part of the app opens before it is done, and an attempt to remove the only active method is refused. [[#failure-states #permissions]]
**What enrollment records.** The row that registers a method holds the account, the method name and an active flag in plaintext, so a database dump shows which accounts use which kind of second factor. The secrets each method needs sit in encrypted columns beside it, and the backup codes are stored only as hashes. [The trust boundary](#deep-dive/the-trust-boundary) covers what else is plaintext in the schema. [[#metadata #server-holds]]
**Re-verification inside a session.** The session row carries a flag for whether the second factor has been satisfied, and a request arriving from a different address than the one the session was opened from clears it. The next request asks for a second factor again without ending the session or discarding work in progress. [[#failure-states #privacy]]
**The enforcement points.** Method registration, challenge and verification are all in \`packages/server/src/auth/two-factor-service.ts\` behind the routes in \`packages/server/src/routes/two-factor.ts\`. The registry table is \`packages/server/src/db/migrations/tenant/010_create_two_factor_methods.ts\` and the session flag comes from \`005_add_session_2fa.ts\`. The challenge is rendered inline on the login page by \`packages/client/src/lib/components/auth/TwoFactorChallenge.svelte\`. [[#permissions #server-holds]]`)
};

const es_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una contraseña correcta por sí sola no abre los datos de los casos. Cada inicio de sesión pide además un segundo factor por un canal aparte, y el navegador solo empieza a derivar claves de cifrado cuando esa comprobación se ha superado, así que quien tenga únicamente la contraseña nunca consigue material de claves dentro de la pestaña. [[#keys #encryption]]
**Los métodos.** Se puede inscribir cualquier número de ellos a la vez y cada uno funciona por su cuenta. [[#privacy]]
- [Passkeys y llaves de seguridad](#login/passkey) trata las opciones ligadas al dispositivo, las únicas que un atacante no puede usar desde otro sitio. [[#keys]]
- [Códigos de aplicación de autenticación](#login/totp) trata la opción de seis dígitos que funciona sin conexión. [[#privacy]]
- [Códigos por correo](#login/email) y [Códigos por mensaje de texto](#login/sms) tratan las dos opciones que se entregan y lo que el servidor necesita poder leer para ellas. [[#server-holds #telephony]]
- [Aprobación push](#login/push) trata la solicitud que se envía a una aplicación instalada. [[#privacy]]
- [Códigos de respaldo](#login/backup-codes) trata el conjunto de un solo uso que se genera junto con la primera inscripción. [[#failure-states]]
**El último método.** El segundo factor no se puede desactivar una vez activado. Inscribir uno es obligatorio en el primer inicio de sesión de una cuenta nueva y ninguna parte de la aplicación se abre antes de hacerlo, y un intento de eliminar el único método activo se rechaza. [[#failure-states #permissions]]
**Lo que registra una inscripción.** La fila que registra un método guarda la cuenta, el nombre del método y una marca de activo en texto plano, así que un volcado de la base de datos muestra qué cuentas usan qué clase de segundo factor. Los secretos que necesita cada método están en columnas cifradas junto a ella, y los códigos de respaldo se guardan solo como hashes. [La frontera de confianza](#deep-dive/the-trust-boundary) trata qué más hay en texto plano en el esquema. [[#metadata #server-holds]]
**Reverificación dentro de una sesión.** La fila de la sesión lleva una marca de si el segundo factor se ha satisfecho, y una solicitud que llega desde una dirección distinta de aquella con la que se abrió la sesión la borra. La solicitud siguiente vuelve a pedir un segundo factor sin cerrar la sesión ni descartar el trabajo en curso. [[#failure-states #privacy]]
**Los puntos de aplicación.** El registro de métodos, el desafío y la verificación están en \`packages/server/src/auth/two-factor-service.ts\`, detrás de las rutas de \`packages/server/src/routes/two-factor.ts\`. La tabla de registro es \`packages/server/src/db/migrations/tenant/010_create_two_factor_methods.ts\` y la marca de sesión viene de \`005_add_session_2fa.ts\`. El desafío se presenta dentro de la página de inicio de sesión mediante \`packages/client/src/lib/components/auth/TwoFactorChallenge.svelte\`. [[#permissions #server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À pàsswòrd àlònè ìs nòt ènòùgh tò àccèss càsè dàtà. Èvèry sìgn-ìn àlsò rèqùìrès à sècònd fàctòr tò cònfìrm ìdèntìty thròùgh à sèpàràtè chànnèl.
Fìvè mèthòds àrè àvàìlàblè: àùthèntìcàtòr àpps, pàsskèys, èmàìl còdès, SMS còdès, ànd pùsh àppròvàl. Mùltìplè mèthòds càn bè ènròllèd sìmùltànèòùsly, ànd èàch wòrks ìndèpèndèntly. Thè systèm gènèràtès à sèt òf ònè-tìmè bàckùp còdès àt fìrst ènròllmènt. Thè làst rèmàìnìng mèthòd cànnòt bè rèmòvèd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Ùntìl à sècònd-fàctòr chèck ìs còmplètèd, thè sèssìòn cànnòt rèàd àny èncryptèd càsè dàtà, èvèn ìf thè pàsswòrd wàs còrrèct. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A correct password alone does not open case data. Every sign-in also asks for a second factor through a separate channel, and the browser starts deriving enc..." |
*
* @param {Demo_Narrative_Topic_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_body(inputs)
	return en_demo_narrative_topic_twofa_body(inputs)
});