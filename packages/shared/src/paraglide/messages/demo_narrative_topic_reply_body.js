/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Reply_BodyInputs */

const en_demo_narrative_topic_reply_body = /** @type {(inputs: Demo_Narrative_Topic_Reply_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your reply is encrypted on device before it reaches the server. The server relays ciphertext to the intended recipient. If the channel is SMS, the relay forwards to the carrier and zeros the buffer immediately.`)
};

const es_demo_narrative_topic_reply_body = /** @type {(inputs: Demo_Narrative_Topic_Reply_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu respuesta se cifra en el dispositivo antes de llegar al servidor. El servidor retransmite texto cifrado al destinatario previsto. Si el canal es SMS, el relay envia al operador y borra el buffer inmediatamente.`)
};

/**
* | output |
* | --- |
* | "Your reply is encrypted on device before it reaches the server. The server relays ciphertext to the intended recipient. If the channel is SMS, the relay forw..." |
*
* @param {Demo_Narrative_Topic_Reply_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_reply_body = /** @type {((inputs?: Demo_Narrative_Topic_Reply_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Reply_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_reply_body(inputs)
	return es_demo_narrative_topic_reply_body(inputs)
});