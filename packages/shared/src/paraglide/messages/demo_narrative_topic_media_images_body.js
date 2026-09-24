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

const en_xa2_demo_narrative_topic_media_images_body = /** @type {(inputs: Demo_Narrative_Topic_Media_Images_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phòtòs thàt clìènts tèxt ìn òvèr MMS àrè stòrèd às èncryptèd bìnàry òn thè sèrvèr ànd dècryptèd ìn thè bròwsèr bèfòrè à thùmbnàìl àppèàrs ìn thè thrèàd. Tàppìng thè thùmbnàìl òpèns à fùll scrèèn vìèwèr thàt rèndèrs thè ìmàgè àt ìts òrìgìnàl rèsòlùtìòn whìlè thè dècryptèd bytès stày ìn mèmòry òn thè dèvìcè ànd àrè nèvèr wrìttèn bàck tò thè sèrvèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Photos that clients text in over MMS are stored as encrypted binary on the server and decrypted in the browser before a thumbnail appears in the thread. Tapp..." |
*
* @param {Demo_Narrative_Topic_Media_Images_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_media_images_body = /** @type {((inputs?: Demo_Narrative_Topic_Media_Images_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Media_Images_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_media_images_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_media_images_body(inputs)
	return en_demo_narrative_topic_media_images_body(inputs)
});