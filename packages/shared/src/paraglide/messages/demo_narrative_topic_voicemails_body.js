/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Voicemails_BodyInputs */

const en_demo_narrative_topic_voicemails_body = /** @type {(inputs: Demo_Narrative_Topic_Voicemails_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A voicemail left on the organization's line becomes an entry on the client's case with an audio the browser opens and the server cannot. [[#telephony #encryption]]
**What happens to the audio before it is stored.** The server fetches the recording from the provider, seals it with the case key, writes the ciphertext to blob storage and then asks the provider to delete both the recording and the call log it belongs to. The audio exists in plaintext for the length of that one handler call, in buffers the code zeroes, and a delete the provider refuses is queued and retried. [The telephony relay](#deep-dive/the-telephony-relay) covers the rules that endpoint works under. [[#server-holds #telephony #retention]]
**When a recording cannot be placed on a case.** A voicemail whose call cannot be matched to a client or a queue is sealed to the organization key and held in quarantine for an administrator to route by hand, rather than being stored in the open or discarded. [Voicemail quarantine](#admin-comms/quarantine) covers what an administrator can do with one. [[#failure-states #encryption]]
**What playback costs and what it does not.** The browser fetches the ciphertext over an endpoint that checks permission to download case media and decrypts nothing itself, opens it, and decodes the audio on the device, so the decrypted sound exists in one tab and is dropped when the entry is closed. The row beside the audio holds its size, its duration and its times in plaintext, so a database dump shows that a case received a ninety-second voicemail on a given evening. [[#permissions #privacy #metadata]]
**Two envelopes for one recording.** A recording is either sealed directly under the case key or sealed under a key of its own that the case key unwraps, and the audio is bound to its row identifier either way, so ciphertext moved to another row fails to open. A copy is also sealed to the client's channel key when one is active, so the client can hear their own voicemail on their private page. [How encryption works](#deep-dive/how-encryption-works) covers the binding. [[#keys #encryption #portal]]
**The recording handler and its row.** \`packages/server/src/telephony/recording-handler.ts\` runs the store-then-delete sequence, \`voicemail-quarantine.ts\` holds the unroutable ones, and the row comes from \`027_create_recordings.ts\`. The player is \`VoicemailPlayer.svelte\`, which takes an injected decrypt callback built in \`packages/client/src/lib/tickets/recording-decrypt.ts\` so the case thread and the client's own thread share one player. [[#client-data]]`)
};

const es_demo_narrative_topic_voicemails_body = /** @type {(inputs: Demo_Narrative_Topic_Voicemails_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un mensaje de voz dejado en la línea de la organización se convierte en una entrada del caso del cliente, con un audio que el navegador abre y el servidor no. [[#telephony #encryption]]
**Qué le pasa al audio antes de guardarse.** El servidor recoge la grabación del proveedor, la sella con la clave del caso, escribe el texto cifrado en el almacén de objetos y luego le pide al proveedor que borre tanto la grabación como el registro de la llamada a la que pertenece. El audio existe en claro durante esa única ejecución del manejador, en búferes que el código pone a cero, y un borrado que el proveedor rechaza se encola y se reintenta. [El relé de telefonía](#deep-dive/the-telephony-relay) trata las reglas bajo las que trabaja ese extremo. [[#server-holds #telephony #retention]]
**Cuando una grabación no puede colocarse en un caso.** Un mensaje de voz cuya llamada no puede asociarse a un cliente ni a una cola se sella con la clave de la organización y queda en cuarentena para que una persona administradora lo encamine a mano, en lugar de guardarse en claro o descartarse. [Cuarentena de mensajes de voz](#admin-comms/quarantine) trata lo que puede hacer con él una persona administradora. [[#failure-states #encryption]]
**Lo que cuesta reproducirlo y lo que no.** El navegador recoge el texto cifrado por un extremo que comprueba el permiso de descarga de archivos del caso y no descifra nada por su cuenta, lo abre y decodifica el audio en el dispositivo, de modo que el sonido descifrado existe en una pestaña y se suelta al cerrar la entrada. La fila que acompaña al audio guarda su tamaño, su duración y sus fechas en texto plano, así que un volcado de la base de datos muestra que un caso recibió un mensaje de voz de noventa segundos cierta tarde. [[#permissions #privacy #metadata]]
**Dos sobres para una grabación.** Una grabación se sella directamente con la clave del caso o con una clave propia que la del caso desenvuelve, y en ambos casos el audio queda ligado al identificador de su fila, así que un texto cifrado trasladado a otra fila no se abre. Además se sella una copia con la clave del canal del cliente cuando hay uno activo, para que el cliente pueda oír su propio mensaje de voz en su página privada. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata esa ligadura. [[#keys #encryption #portal]]
**El manejador de grabaciones y su fila.** \`packages/server/src/telephony/recording-handler.ts\` ejecuta la secuencia de guardar y luego borrar, \`voicemail-quarantine.ts\` retiene las que no se pueden encaminar, y la fila viene de \`027_create_recordings.ts\`. El reproductor es \`VoicemailPlayer.svelte\`, que recibe una función de descifrado construida en \`packages/client/src/lib/tickets/recording-decrypt.ts\`, de modo que el hilo del caso y el hilo propio del cliente comparten un solo reproductor. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_voicemails_body = /** @type {(inputs: Demo_Narrative_Topic_Voicemails_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn à clìènt lèàvès à vòìcèmàìl òn thè phònè lìnè, thè rècòrdìng ìs stòrèd èncryptèd ànd thè bròwsèr dècrypts ànd dècòdès thè àùdìò lòcàlly, sò thè sèrvèr ònly stòrès ànd sèrvès èncryptèd bytès. Thè plàybàck còntròl ìn thè thrèàd lèts thè vòlùntèèr lìstèn, scrùb, ànd rèplày whìlè thè dècryptèd àùdìò stàys òn thè dèvìcè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A voicemail left on the organization's line becomes an entry on the client's case with an audio the browser opens and the server cannot. [[#telephony #encryp..." |
*
* @param {Demo_Narrative_Topic_Voicemails_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_voicemails_body = /** @type {((inputs?: Demo_Narrative_Topic_Voicemails_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Voicemails_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_voicemails_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_voicemails_body(inputs)
	return en_demo_narrative_topic_voicemails_body(inputs)
});