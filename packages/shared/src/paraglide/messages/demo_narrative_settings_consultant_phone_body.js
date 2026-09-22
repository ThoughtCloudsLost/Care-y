/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Consultant_Phone_BodyInputs */

const en_demo_narrative_settings_consultant_phone_body = /** @type {(inputs: Demo_Narrative_Settings_Consultant_Phone_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A user who takes calls on a personal phone registers the number here, and a code sent to that number has to come back before any call is bridged to it. [[#telephony #privacy]]
**The one path the number travels.** Registration submits the number to the relay, the part of the server built to handle plaintext and zero it, and from that single copy the server derives what it keeps: a box sealed to the organization's public key that only the user's browser opens, and a keyed hash it will compare later. The copy it can read itself is derived only when SMS pings are asked for. The buffer is zeroed once the verification message has gone. [The telephony relay](#deep-dive/the-telephony-relay) covers the rest of that boundary. [[#trust-boundary #telephony]]
**Proving the number.** The code is six digits and lasts fifteen minutes, a third wrong entry clears it and requires a new send, and a new send is refused inside sixty seconds of the last one or past five in an hour. Staging a different number clears the verified state, so a number that was never proved cannot inherit the standing of one that was. [[#failure-states]]
**What each stored form is for.** The keyed hash lets the server check that the number submitted with a call request is the number that was verified, compared without revealing where it differs, so a compromised session cannot redirect a client call to another phone. The readable copy exists to send SMS pings when no browser is open. Without pings, the server holds a number it cannot read and a hash it can only match against. [[#server-holds #telephony]]
**Turning pings off, and what it costs to turn them back on.** Switching pings off deletes the readable copy in the same statement that records the switch. Switching them on again is refused, because the server has no plaintext left to encrypt, and the number has to be verified once more. Removing the registration clears the sealed copy, the hash, the readable copy and the verified state together, and calls run through the browser from then on. [[#failure-states #server-holds]]
**The honest limit on a bridged call.** Every call and every ping hands the number to the telephony provider, which is outside the encryption boundary, so the provider and the carrier learn that this number spoke to that number and when. The encryption decides what the server can read, and it does not reach the phone network. [[#telephony #trust-boundary]]
**The verification endpoint and the columns.** The single write path is \`/relay/consultant-verify\` in \`packages/server/src/routes/relay.ts\`, over \`prepareVerification\` in \`packages/server/src/telephony/consultant-service.ts\`. The columns are \`encrypted_phone\`, \`ops_phone_hash\`, \`ops_encrypted_phone\` and the rate-limit counters from \`packages/server/src/db/migrations/tenant/087_consultant_reachability.ts\`, and the hash is keyed under a label of its own so a volunteer number is never matched against a client number. [[#server-holds #telephony]]`)
};

const es_demo_narrative_settings_consultant_phone_body = /** @type {(inputs: Demo_Narrative_Settings_Consultant_Phone_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una persona usuaria que atiende llamadas desde un teléfono personal registra aquí el número, y un código enviado a ese número tiene que volver antes de que se le puentee ninguna llamada. [[#telephony #privacy]]
**La única ruta que recorre el número.** El registro envía el número al relay, la parte del servidor construida para manejar texto en claro y ponerlo a cero, y de esa única copia el servidor deriva lo que conserva: una caja sellada con la clave pública de la organización que solo abre el navegador de esa persona, y un hash con clave que comparará más adelante. La copia que él mismo puede leer se deriva únicamente cuando se piden avisos por SMS. El búfer se pone a cero en cuanto sale el mensaje de verificación. [El relay de telefonía](#deep-dive/the-telephony-relay) trata el resto de esa frontera. [[#trust-boundary #telephony]]
**Demostrar el número.** El código tiene seis dígitos y dura quince minutos, una tercera entrada incorrecta lo borra y obliga a un envío nuevo, y un envío nuevo se rechaza dentro de los sesenta segundos siguientes al anterior o pasados cinco en una hora. Preparar un número distinto borra el estado de verificado, así que un número que nunca se demostró no puede heredar la posición de uno que sí. [[#failure-states]]
**Para qué sirve cada forma almacenada.** El hash con clave permite al servidor comprobar que el número enviado con una solicitud de llamada es el número que se verificó, comparado sin revelar en qué se diferencia, de modo que una sesión comprometida no puede desviar la llamada de un cliente a otro teléfono. La copia legible existe para enviar avisos por SMS cuando no hay ningún navegador abierto. Sin esos avisos, el servidor guarda un número que no puede leer y un hash que solo puede cotejar. [[#server-holds #telephony]]
**Apagar los avisos, y lo que cuesta volver a encenderlos.** Apagar los avisos borra la copia legible en la misma instrucción que registra el cambio. Volver a encenderlos se rechaza, porque al servidor no le queda texto en claro que cifrar, y el número tiene que verificarse otra vez. Eliminar el registro borra a la vez la copia sellada, el hash, la copia legible y el estado de verificado, y las llamadas pasan a partir de entonces por el navegador. [[#failure-states #server-holds]]
**El límite honesto de una llamada puenteada.** Cada llamada y cada aviso entregan el número al proveedor de telefonía, que está fuera de la frontera de cifrado, así que el proveedor y la operadora saben que ese número habló con aquel otro y cuándo. El cifrado decide qué puede leer el servidor, y no alcanza a la red telefónica. [[#telephony #trust-boundary]]
**El extremo de verificación y las columnas.** La única ruta de escritura es \`/relay/consultant-verify\`, en \`packages/server/src/routes/relay.ts\`, sobre \`prepareVerification\`, en \`packages/server/src/telephony/consultant-service.ts\`. Las columnas son \`encrypted_phone\`, \`ops_phone_hash\`, \`ops_encrypted_phone\` y los contadores de límite de frecuencia, de \`packages/server/src/db/migrations/tenant/087_consultant_reachability.ts\`, y el hash se calcula bajo una etiqueta propia para que un número de una persona voluntaria nunca se coteje con el de un cliente. [[#server-holds #telephony]]`)
};

const en_xa2_demo_narrative_settings_consultant_phone_body = /** @type {(inputs: Demo_Narrative_Settings_Consultant_Phone_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À ùsèr whò tàkès càlls fròm à pèrsònàl phònè càn règìstèr ìt thròùgh à thrèè stèp vèrìfìcàtìòn flòw thàt cònfìrms thè nùmbèr bèfòrè àctìvàtìng ìt.
 •••••••••••••••••••••••••••••••••••••••••••••**Rèmòvìng. •••** Rèmòvìng à vèrìfìèd nùmbèr rèvèrts thè ùsèr tò càll hàndlìng thròùgh thè bròwsèr sòftphònè ònly, ànd thè chàngè tàkès èffèct ìmmèdìàtèly.
 ••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè cònsùltànt phònè nùmbèr ìs sèàlèd tò thè òrgànìzàtìòn's pùblìc kèy sò thè sèrvèr cànnòt rèàd ìt àt rèst. Whèn thè ùsèr òpts ìntò SMS nòtìfìcàtìòn pìngs, à sècònd còpy ìs stòrèd ùndèr à sèrvèr rèàdàblè òpèràtìònàl kèy sò thè sèrvèr càn sènd thòsè pìngs wìthòùt à bròwsèr prèsènt, ànd dìsàblìng pìngs dèlètès thàt sècònd còpy. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A user who takes calls on a personal phone registers the number here, and a code sent to that number has to come back before any call is bridged to it. [[#te..." |
*
* @param {Demo_Narrative_Settings_Consultant_Phone_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_consultant_phone_body = /** @type {((inputs?: Demo_Narrative_Settings_Consultant_Phone_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Consultant_Phone_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_consultant_phone_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_settings_consultant_phone_body(inputs)
	return en_demo_narrative_settings_consultant_phone_body(inputs)
});