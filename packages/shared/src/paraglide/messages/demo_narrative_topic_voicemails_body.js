/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Voicemails_BodyInputs */

const en_demo_narrative_topic_voicemails_body = /** @type {(inputs: Demo_Narrative_Topic_Voicemails_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a client leaves a voicemail on the phone line, the recording is stored encrypted and the browser decrypts and decodes the audio locally, so the server only stores and serves encrypted bytes. The playback control in the thread lets the volunteer listen, scrub, and replay without the recording ever leaving the device.`)
};

const es_demo_narrative_topic_voicemails_body = /** @type {(inputs: Demo_Narrative_Topic_Voicemails_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando un cliente deja un mensaje de voz en la línea telefónica, la grabación se almacena cifrada y el navegador la descifra y decodifica localmente, de modo que el servidor solo guarda y entrega datos cifrados. El control de reproducción en el hilo permite al voluntario escuchar, avanzar y repetir sin que la grabación salga nunca del dispositivo.`)
};

/**
* | output |
* | --- |
* | "When a client leaves a voicemail on the phone line, the recording is stored encrypted and the browser decrypts and decodes the audio locally, so the server o..." |
*
* @param {Demo_Narrative_Topic_Voicemails_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_voicemails_body = /** @type {((inputs?: Demo_Narrative_Topic_Voicemails_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Voicemails_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_voicemails_body(inputs)
	return es_demo_narrative_topic_voicemails_body(inputs)
});