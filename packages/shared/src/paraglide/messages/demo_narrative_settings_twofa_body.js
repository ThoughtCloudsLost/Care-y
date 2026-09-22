/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Twofa_BodyInputs */

const en_demo_narrative_settings_twofa_body = /** @type {(inputs: Demo_Narrative_Settings_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every second-factor method an account uses is enrolled and removed from settings, and an account can hold several at once with each one working on its own. [Two factor authentication](#login/two-factor) covers what a sign-in does with them. [[#privacy #permissions]]
**What enrolling one costs.** A [passkey](#login/passkey) or an [authenticator app](#login/totp) is proved on the spot, from the device or from a code the app shows. [Email](#login/email) and [text message](#login/sms) enrollment send a code to the address or number given and keep the method inactive until that code comes back, so a mistyped number never becomes a way in that nobody holds. [Push approval](#login/push) needs the app installed on the device that will answer. [[#failure-states #keys]]
**How often a verification code can be re-sent.** Sixty seconds between email codes and ninety between text messages, from one set of values the server enforces and the browser counts down from, so the wait shown and the wait applied cannot drift apart. [[#failure-states #telephony]]
**Removing one, and the floor under removal.** Removal runs only from a session that has already satisfied a second factor this sitting, and the last active method is refused, so there is no sequence of settings changes that leaves an account with a password alone. [[#permissions #failure-states]]
**Regenerating the codes on paper.** [Backup codes](#login/backup-codes) are issued as a set of eight when the first method is enrolled, and asking for a new set replaces the old one, so codes written down earlier stop working at that moment rather than accumulating. [[#failure-states]]
**What the enrollment list is.** The status query answers with the method names on the account and how many backup codes remain, all of it read from plaintext columns, so a database dump shows which accounts use which kinds of second factor and how far into their backup set they are. [The trust boundary](#deep-dive/the-trust-boundary) covers the rest of the plaintext schema. [[#server-holds #metadata]]
**The enrollment routes and the shared address.** Enrollment, verification and removal are the \`enroll\` and \`methods\` routers in \`packages/server/src/routes/two-factor.ts\` over \`packages/server/src/auth/two-factor-service.ts\`, with the cooldowns in \`packages/shared/src/schemas/auth.ts\`. Email enrollment writes \`users.encrypted_notification_addr\`, the same column notification email is sent to, so an account has one address rather than two. [Notification preferences](#settings/notifications) covers the other use of it. [[#server-holds]]`)
};

const es_demo_narrative_settings_twofa_body = /** @type {(inputs: Demo_Narrative_Settings_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos los métodos de segundo factor que usa una cuenta se inscriben y se eliminan desde los ajustes, y una cuenta puede tener varios a la vez, cada uno funcionando por su cuenta. [Autenticación de doble factor](#login/two-factor) trata lo que hace con ellos un inicio de sesión. [[#privacy #permissions]]
**Lo que cuesta inscribir uno.** Una [passkey](#login/passkey) o una [aplicación de autenticación](#login/totp) se demuestran en el momento, desde el dispositivo o con un código que muestra la aplicación. La inscripción por [correo](#login/email) y por [mensaje de texto](#login/sms) envía un código a la dirección o al número indicados y mantiene el método inactivo hasta que ese código vuelve, de modo que un número mal tecleado nunca se convierte en una vía de acceso que no tiene nadie. La [aprobación push](#login/push) necesita la aplicación instalada en el dispositivo que vaya a responder. [[#failure-states #keys]]
**Con qué frecuencia se puede reenviar un código de verificación.** Sesenta segundos entre códigos por correo y noventa entre mensajes de texto, a partir de un único juego de valores que el servidor aplica y desde el que el navegador cuenta atrás, así que la espera mostrada y la espera aplicada no pueden separarse. [[#failure-states #telephony]]
**Eliminar uno, y el suelo que hay debajo.** La eliminación solo se ejecuta desde una sesión que ya ha satisfecho un segundo factor en esa misma sesión, y el último método activo se rechaza, de modo que no hay ninguna secuencia de cambios en los ajustes que deje una cuenta con la contraseña sola. [[#permissions #failure-states]]
**Regenerar los códigos de papel.** Los [códigos de respaldo](#login/backup-codes) se emiten en un conjunto de ocho al inscribir el primer método, y pedir un conjunto nuevo sustituye al anterior, así que los códigos anotados antes dejan de funcionar en ese momento en lugar de acumularse. [[#failure-states]]
**Qué es la lista de inscripciones.** La consulta de estado responde con los nombres de los métodos de la cuenta y cuántos códigos de respaldo quedan, todo ello leído de columnas en texto plano, así que un volcado de la base de datos muestra qué cuentas usan qué clases de segundo factor y por dónde van en su conjunto de respaldo. [La frontera de confianza](#deep-dive/the-trust-boundary) trata el resto del esquema en texto plano. [[#server-holds #metadata]]
**Las rutas de inscripción y la dirección compartida.** La inscripción, la verificación y la eliminación son los enrutadores \`enroll\` y \`methods\` de \`packages/server/src/routes/two-factor.ts\`, sobre \`packages/server/src/auth/two-factor-service.ts\`, con los tiempos de espera en \`packages/shared/src/schemas/auth.ts\`. La inscripción por correo escribe \`users.encrypted_notification_addr\`, la misma columna a la que se envía el correo de notificación, de modo que una cuenta tiene una dirección y no dos. [Preferencias de notificación](#settings/notifications) trata el otro uso de esa columna. [[#server-holds]]`)
};

const en_xa2_demo_narrative_settings_twofa_body = /** @type {(inputs: Demo_Narrative_Settings_Twofa_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll sùppòrtèd sècònd fàctòr mèthòds àrè ènròllèd fròm thìs pàgè.
 ••••••••••••••••••••**Àvàìlàblè mèthòds. ••••••** Pàsskèys (plàtfòrm àùthèntìcàtòrs ànd cròss plàtfòrm sècùrìty kèys), àùthèntìcàtòr àpp còdès (TÒTP), èmàìl còdès, tèxt mèssàgè còdès, ànd pùsh àppròvàl. Bàckùp còdès àrè gènèràtèd àùtòmàtìcàlly àftèr thè fìrst mèthòd ìs ènròllèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ènròllmènt flòw. •••••** Èàch mèthòd hàs ìts òwn ènròllmènt shèèt wìth sètùp ìnstrùctìòns ànd vèrìfìcàtìòn. Thè sìmùlàtòr stànds ìn fòr èxtèrnàl dèvìcès by àùtò fìllìng vèrìfìcàtìòn còdès àftèr à shòrt dèlày, whìlè thè sèrvèr sìdè vèrìfìcàtìòn ìs rèàl. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Every second-factor method an account uses is enrolled and removed from settings, and an account can hold several at once with each one working on its own. [..." |
*
* @param {Demo_Narrative_Settings_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_twofa_body = /** @type {((inputs?: Demo_Narrative_Settings_Twofa_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Twofa_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_twofa_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_twofa_body(inputs)
	return en_demo_narrative_settings_twofa_body(inputs)
});