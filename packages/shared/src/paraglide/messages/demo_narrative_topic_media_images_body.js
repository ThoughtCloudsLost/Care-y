/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Media_Images_BodyInputs */

const en_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Photos that clients text in over MMS are stored as encrypted binary on the server and decrypted in the browser before a thumbnail appears in the thread. Tapping the thumbnail opens a full screen viewer that renders the image at its original resolution while the decrypted bytes stay in memory on the device and are never written back to the server.`)
};

const es_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las fotos que los clientes envían por MMS se almacenan como datos binarios cifrados en el servidor y se descifran en el navegador antes de que aparezca una miniatura en el hilo. Al tocar la miniatura se abre un visor a pantalla completa que muestra la imagen en su resolución original mientras los bytes descifrados permanecen en la memoria del dispositivo y nunca se envían de vuelta al servidor.`)
};

/**
* | output |
* | --- |
* | "Photos that clients text in over MMS are stored as encrypted binary on the server and decrypted in the browser before a thumbnail appears in the thread. Tapp..." |
*
* @param {Demo_Narrative_Topic_Media_Images_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_media_images_body = /** @type {((inputs?: Demo_Narrative_Topic_Media_Images_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Media_Images_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_media_images_body(inputs)
	return es_demo_narrative_topic_media_images_body(inputs)
});