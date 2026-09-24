/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Voicemails_BodyInputs */

const en_demo_narrative_topic_voicemails_body = /** @type {(inputs: Demo_Narrative_Topic_Voicemails_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a client leaves a voicemail on the phone line, the recording is stored encrypted and the browser decrypts and decodes the audio locally, so the server only stores and serves encrypted bytes. The playback control in the thread lets the volunteer listen, scrub, and replay while the decrypted audio stays on the device.`)
};

const es_demo_narrative_topic_voicemails_body = /** @type {(inputs: Demo_Narrative_Topic_Voicemails_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando un cliente deja un mensaje de voz en la línea telefónica, la grabación se almacena cifrada y el navegador la descifra y decodifica localmente, de modo que el servidor solo guarda y entrega datos cifrados. El control de reproducción en el hilo permite al voluntario escuchar, avanzar y repetir mientras el audio descifrado permanece en el dispositivo.`)
};

const en_xa2_demo_narrative_topic_voicemails_body = /** @type {(inputs: Demo_Narrative_Topic_Voicemails_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn à clìènt lèàvès à vòìcèmàìl òn thè phònè lìnè, thè rècòrdìng ìs stòrèd èncryptèd ànd thè bròwsèr dècrypts ànd dècòdès thè àùdìò lòcàlly, sò thè sèrvèr ònly stòrès ànd sèrvès èncryptèd bytès. Thè plàybàck còntròl ìn thè thrèàd lèts thè vòlùntèèr lìstèn, scrùb, ànd rèplày whìlè thè dècryptèd àùdìò stàys òn thè dèvìcè. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When a client leaves a voicemail on the phone line, the recording is stored encrypted and the browser decrypts and decodes the audio locally, so the server o..." |
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