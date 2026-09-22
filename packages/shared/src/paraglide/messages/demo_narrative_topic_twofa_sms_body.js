/* eslint-disable */
import * as registry from '../registry.js'
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Sms_BodyInputs */

const en_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A six-digit code is sent by text to the number enrolled on the account. It is good for five minutes and a third wrong entry deletes it, the same shape as an email code with a stricter limit on how often it can be asked for. [[#telephony #failure-states]]
**Proving the number before it counts.** Enrolling a number stores it inactive and sends a code to it, and the method starts working only once a code sent to that number comes back correct. Removing the method clears both the stored number and its lookup hash in the same write. [[#failure-states #server-holds]]
**What the server stores for an enrolled number.** The number itself under the server's operational encryption, because it has to be handed to a telephony provider, plus a keyed hash of it used to notice the same number enrolled twice. A database dump shows that an account has an SMS factor and that two accounts share a number, and not what the number is. [[#server-holds #metadata]]
**What a text code costs to request.** One code per ninety seconds per account and three in an hour, tighter than the email limits because every message is billed to the organization. [[#telephony #failure-states]]
**Why this is the weakest option.** A phone number can be moved to an attacker's device by convincing a carrier to do it, and the message itself is readable by the carrier and by the telephony provider that hands it over, neither of which is inside the encryption boundary. Of the methods offered this one protects least, and it is kept for accounts where an app or a security key is not workable. [The telephony relay](#deep-dive/the-telephony-relay) covers what leaves the boundary on the phone side. [[#telephony #trust-boundary]]
**The code service and the enrollment columns.** The service is \`packages/server/src/auth/sms-code.ts\` with the row in \`packages/server/src/db/migrations/tenant/016_create_sms_codes.ts\`, which also adds \`encrypted_sms_phone\` and \`sms_phone_hash\` to the method registry. Enrollment and removal are \`storePendingSmsPhone\` and the method-removal path in \`packages/server/src/auth/two-factor-service.ts\`. [[#telephony #server-holds]]`)
};

const es_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se envía un código de seis dígitos por mensaje de texto al número inscrito en la cuenta. Vale durante cinco minutos y una tercera entrada incorrecta lo elimina, con la misma forma que un código por correo y un límite más estricto sobre la frecuencia con que se puede pedir. [[#telephony #failure-states]]
**Demostrar el número antes de que cuente.** Al inscribir un número se guarda inactivo y se le envía un código, y el método empieza a funcionar solo cuando un código enviado a ese número vuelve correcto. Eliminar el método borra en la misma escritura tanto el número guardado como su hash de búsqueda. [[#failure-states #server-holds]]
**Lo que el servidor guarda de un número inscrito.** El número en sí bajo el cifrado operativo del servidor, porque hay que entregarlo a un proveedor de telefonía, más un hash con clave que sirve para detectar el mismo número inscrito dos veces. Un volcado de la base de datos muestra que una cuenta tiene un factor por SMS y que dos cuentas comparten un número, y no cuál es el número. [[#server-holds #metadata]]
**Lo que cuesta pedir un código por texto.** Un código cada noventa segundos por cuenta y tres en una hora, más ajustado que los límites del correo porque cada mensaje se le factura a la organización. [[#telephony #failure-states]]
**Por qué es la opción más débil.** Un número de teléfono puede trasladarse al dispositivo de un atacante convenciendo a una operadora de que lo haga, y el propio mensaje es legible para la operadora y para el proveedor de telefonía que lo entrega, y ninguno de los dos está dentro de la frontera de cifrado. De los métodos que se ofrecen, este es el que menos protege, y se mantiene para cuentas en las que una aplicación o una llave de seguridad no son viables. [El relay de telefonía](#deep-dive/the-telephony-relay) trata lo que sale de la frontera por el lado telefónico. [[#telephony #trust-boundary]]
**El servicio de códigos y las columnas de inscripción.** El servicio es \`packages/server/src/auth/sms-code.ts\`, con la fila en \`packages/server/src/db/migrations/tenant/016_create_sms_codes.ts\`, que además añade \`encrypted_sms_phone\` y \`sms_phone_hash\` al registro de métodos. La inscripción y la eliminación son \`storePendingSmsPhone\` y la ruta de eliminación de métodos en \`packages/server/src/auth/two-factor-service.ts\`. [[#telephony #server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_sms_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À sìx-dìgìt còdè ìs sènt by tèxt mèssàgè tò thè ènròllèd phònè nùmbèr. Ìt èxpìrès àftèr fìvè mìnùtès ànd ìs dèlètèd àftèr thrèè ìncòrrèct àttèmpts.
 •••••••••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Lìkè èmàìl, thè phònè nùmbèr ìs stòrèd ùndèr òpèràtìònàl èncryptìòn sò thè sèrvèr càn rèàch ìt.
 ••••••••••••••••••••••••••••••**Sècùrìty tràdèòff. ••••••** SMS càrrìès àddìtìònàl èxpòsùrè: càrrìèrs càn bè tàrgètèd thròùgh sòcìàl èngìnèèrìng, ànd thè tèlèphòny pròvìdèr hàndlès thè mèssàgè ìn clèàrtèxt. Òf thè àvàìlàblè mèthòds, SMS pròvìdès thè lèàst pròtèctìòn. Ìt ìs òffèrèd às à cònvènìèncè fàllbàck whèn stròngèr òptìòns àrè nòt pràctìcàl. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A six-digit code is sent by text to the number enrolled on the account. It is good for five minutes and a third wrong entry deletes it, the same shape as an ..." |
*
* @param {Demo_Narrative_Topic_Twofa_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_sms_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Sms_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Sms_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_sms_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_sms_body(inputs)
	return en_demo_narrative_topic_twofa_sms_body(inputs)
});