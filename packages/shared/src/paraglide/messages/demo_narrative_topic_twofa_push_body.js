/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Push_BodyInputs */

const en_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the app is installed on a device and notifications are allowed, a sign-in sends an approval prompt to that device. Approving it completes the second factor. No code is read, typed, or transmitted. [[#privacy]]
**Binding between prompt and sign-in.** Each challenge is tied to the session that created it by a keyed hash. An approval from a different session cannot complete a sign-in it did not start. The challenge expires after two minutes. A denial, a timeout, or an ignored prompt makes the challenge unusable, but every other enrolled method remains available. [[#failure-states #encryption]]
**What happens when no device is subscribed?** If no push subscription exists on the account, the sign-in reports that nothing was sent instead of waiting. No challenge is created. Push requires the app to be installed and the device to be online, so it is never the only method on an account. [[#failure-states]]
**Empty notification payload.** The notification is sent with no body. The device's service worker fetches the pending challenge from the server and builds the prompt locally. A push relayed through an operating-system vendor's infrastructure carries no account name, no organization name, and no reason for the prompt. [[#privacy #metadata]]
**Push challenge service and storage.** Creation, polling, approval, and expiry are in \`packages/server/src/auth/push-challenge.ts\`, routed through \`packages/server/src/routes/two-factor.ts\`. The challenge row is \`push_challenges\`, defined in \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. [[#server-holds]]`)
};

const es_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando la app está instalada en un dispositivo y las notificaciones están permitidas, un inicio de sesión envía una solicitud de aprobación a ese dispositivo. Aprobarla completa el segundo factor. No se lee, escribe ni transmite ningún código. [[#privacy]]
**Vínculo entre la solicitud y el inicio de sesión.** Cada desafío está ligado a la sesión que lo creó mediante un hash con clave. Una aprobación desde una sesión diferente no puede completar un inicio de sesión que no generó. El desafío expira a los dos minutos. Un rechazo, un vencimiento o una solicitud ignorada inutiliza el desafío, pero todos los demás métodos inscritos permanecen disponibles. [[#failure-states #encryption]]
**¿Qué pasa cuando ningún dispositivo está suscrito?** Si no existe una suscripción push en la cuenta, el inicio de sesión informa que no se envió nada en lugar de esperar. No se crea ningún desafío. Push requiere que la app esté instalada y el dispositivo esté en línea, por lo que nunca es el único método en una cuenta. [[#failure-states]]
**Notificación sin contenido.** La notificación se envía sin cuerpo. El service worker del dispositivo obtiene el desafío pendiente del servidor y construye la solicitud localmente. Un push retransmitido por la infraestructura de un proveedor de sistema operativo no lleva nombre de cuenta, nombre de organización ni motivo de la solicitud. [[#privacy #metadata]]
**Servicio de desafío push y almacenamiento.** La creación, consulta, aprobación y expiración están en \`packages/server/src/auth/push-challenge.ts\`, enrutadas a través de \`packages/server/src/routes/two-factor.ts\`. La fila del desafío es \`push_challenges\`, definida en \`packages/server/src/db/migrations/tenant/001_baseline.ts\`. [[#server-holds]]`)
};

const en_xa2_demo_narrative_topic_twofa_push_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn thè àpp ìs ìnstàllèd òn à dèvìcè ànd nòtìfìcàtìòns àrè àllòwèd, à sìgn-ìn sènds àn àppròvàl pròmpt tò thàt dèvìcè. Àppròvìng ìt còmplètès thè sècònd fàctòr. Nò còdè ìs rèàd, typèd, òr trànsmìttèd. [[#prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Bìndìng bètwèèn pròmpt ànd sìgn-ìn. •••••••••••** Èàch chàllèngè ìs tìèd tò thè sèssìòn thàt crèàtèd ìt by à kèyèd hàsh. Àn àppròvàl fròm à dìffèrènt sèssìòn cànnòt còmplètè à sìgn-ìn ìt dìd nòt stàrt. Thè chàllèngè èxpìrès àftèr twò mìnùtès. À dènìàl, à tìmèòùt, òr àn ìgnòrèd pròmpt màkès thè chàllèngè ùnùsàblè, bùt èvèry òthèr ènròllèd mèthòd rèmàìns àvàìlàblè. [[#fàìlùrè-stàtès #èncryptìòn]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns whèn nò dèvìcè ìs sùbscrìbèd? •••••••••••••** Ìf nò pùsh sùbscrìptìòn èxìsts òn thè àccòùnt, thè sìgn-ìn rèpòrts thàt nòthìng wàs sènt ìnstèàd òf wàìtìng. Nò chàllèngè ìs crèàtèd. Pùsh rèqùìrès thè àpp tò bè ìnstàllèd ànd thè dèvìcè tò bè ònlìnè, sò ìt ìs nèvèr thè ònly mèthòd òn àn àccòùnt. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èmpty nòtìfìcàtìòn pàylòàd. •••••••••** Thè nòtìfìcàtìòn ìs sènt wìth nò bòdy. Thè dèvìcè's sèrvìcè wòrkèr fètchès thè pèndìng chàllèngè fròm thè sèrvèr ànd bùìlds thè pròmpt lòcàlly. À pùsh rèlàyèd thròùgh àn òpèràtìng-systèm vèndòr's ìnfràstrùctùrè càrrìès nò àccòùnt nàmè, nò òrgànìzàtìòn nàmè, ànd nò rèàsòn fòr thè pròmpt. [[#prìvàcy #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pùsh chàllèngè sèrvìcè ànd stòràgè. •••••••••••** Crèàtìòn, pòllìng, àppròvàl, ànd èxpìry àrè ìn \`pàckàgès/sèrvèr/src/àùth/pùsh-chàllèngè.ts\`, ròùtèd thròùgh \`pàckàgès/sèrvèr/src/ròùtès/twò-fàctòr.ts\`. Thè chàllèngè ròw ìs \`pùsh_chàllèngès\`, dèfìnèd ìn \`pàckàgès/sèrvèr/src/db/mìgràtìòns/tènànt/001_bàsèlìnè.ts\`. [[#sèrvèr-hòlds]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When the app is installed on a device and notifications are allowed, a sign-in sends an approval prompt to that device. Approving it completes the second fac..." |
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