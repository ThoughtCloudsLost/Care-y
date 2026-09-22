/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Push_BodyInputs */

const en_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the app is installed on a device and notifications are allowed there, a sign-in sends an approval prompt to that device and approving it completes the second factor, with no code read, typed or transmitted. [[#privacy]]
**What the prompt is bound to.** A challenge is tied to the single session that created it by a keyed hash, so an approval collected from another session cannot finish a sign-in it did not start. It lasts two minutes, and a denial, a timeout or an ignored prompt leaves the challenge unusable while every other enrolled method stays available. [[#failure-states #encryption]]
**When no device is subscribed.** A sign-in that finds no push subscription on the account reports that nothing was sent rather than waiting, and the challenge is never created. Push depends on the app being installed and the device being online, which is why it is never the only method an account has. [[#failure-states]]
**What the push itself carries.** The notification is sent with no body. The device's service worker asks the server for the pending challenge and builds the prompt locally, so a push relayed by an operating system vendor's infrastructure carries no account name, no organization and no reason for the prompt. [[#privacy #metadata]]
**The challenge service and its row.** Creation, polling, approval and expiry are in \`packages/server/src/auth/push-challenge.ts\` behind \`packages/server/src/routes/two-factor.ts\`, and the row is \`packages/server/src/db/migrations/tenant/043_create_push_challenges.ts\`. [[#server-holds]]`)
};

const es_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando la aplicación está instalada en un dispositivo y allí se permiten las notificaciones, un inicio de sesión envía a ese dispositivo una solicitud de aprobación y aceptarla completa el segundo factor, sin ningún código que leer, teclear o transmitir. [[#privacy]]
**A qué queda vinculada la solicitud.** Un desafío queda atado por un hash con clave a la única sesión que lo creó, de modo que una aprobación recogida desde otra sesión no puede terminar un inicio de sesión que no empezó. Dura dos minutos, y un rechazo, una caducidad o una solicitud ignorada dejan el desafío inservible mientras todos los demás métodos inscritos siguen disponibles. [[#failure-states #encryption]]
**Cuando no hay ningún dispositivo suscrito.** Un inicio de sesión que no encuentra ninguna suscripción push en la cuenta informa de que no se envió nada en lugar de quedarse esperando, y el desafío no llega a crearse. El push depende de que la aplicación esté instalada y el dispositivo en línea, y por eso nunca es el único método de una cuenta. [[#failure-states]]
**Lo que lleva el propio push.** La notificación se envía sin cuerpo. El service worker del dispositivo pide al servidor el desafío pendiente y construye la solicitud localmente, así que un push que pasa por la infraestructura del fabricante del sistema operativo no lleva nombre de cuenta, ni organización, ni motivo de la solicitud. [[#privacy #metadata]]
**El servicio de desafíos y su fila.** La creación, el sondeo, la aprobación y la caducidad están en \`packages/server/src/auth/push-challenge.ts\`, detrás de \`packages/server/src/routes/two-factor.ts\`, y la fila es \`packages/server/src/db/migrations/tenant/043_create_push_challenges.ts\`. [[#server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn pùsh nòtìfìcàtìòns àrè ènàblèd, à sìgn-ìn àttèmpt sènds àn àppròvàl pròmpt tò thè dèvìcè. Àppròvìng còmplètès thè sìgn-ìn. Nò còdè ìs ìnvòlvèd.
Èàch pròmpt ìs tìèd tò à sìnglè sèssìòn ànd èxpìrès àftèr twò mìnùtès. À dènìèd òr ìgnòrèd pròmpt ìs dìscàrdèd, ànd àny òthèr ènròllèd mèthòd rèmàìns àvàìlàblè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When the app is installed on a device and notifications are allowed there, a sign-in sends an approval prompt to that device and approving it completes the s..." |
*
* @param {Demo_Narrative_Topic_Twofa_Push_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_push_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Push_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Push_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_push_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_push_body(inputs)
	return en_demo_narrative_topic_twofa_push_body(inputs)
});