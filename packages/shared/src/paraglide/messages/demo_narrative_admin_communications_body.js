/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Communications_BodyInputs */

const en_demo_narrative_admin_communications_body = /** @type {(inputs: Demo_Narrative_Admin_Communications_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The communications page manages phone lines, greetings, SMS templates, a blocklist, and a voicemail quarantine. Two fictional 555 numbers are seeded with purpose roles (intake and outbound). Each line can have text-to-speech or recorded audio greetings. Audio greetings play back through an authenticated endpoint. SMS templates support multiple languages. The quarantine holds voicemails sealed to the organization key. Playback decrypts the audio in the browser, and administrators can route a voicemail to a ticket or dismiss it. The server never sees or hears the audio content.`)
};

const es_demo_narrative_admin_communications_body = /** @type {(inputs: Demo_Narrative_Admin_Communications_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La pagina de comunicaciones gestiona lineas telefonicas, saludos, plantillas SMS, una lista de bloqueo y una cuarentena de correo de voz. Dos numeros ficticios 555 estan configurados con roles de proposito (recepcion y salida). Cada linea puede tener saludos de texto a voz o audio grabado. Los saludos de audio se reproducen a traves de un punto de acceso autenticado. Las plantillas SMS admiten multiples idiomas. La cuarentena contiene correos de voz sellados con la clave de la organizacion. La reproduccion descifra el audio en el navegador, y los administradores pueden enrutar un correo de voz a un ticket o descartarlo. El servidor nunca ve ni escucha el contenido del audio.`)
};

/**
* | output |
* | --- |
* | "The communications page manages phone lines, greetings, SMS templates, a blocklist, and a voicemail quarantine. Two fictional 555 numbers are seeded with pur..." |
*
* @param {Demo_Narrative_Admin_Communications_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_communications_body = /** @type {((inputs?: Demo_Narrative_Admin_Communications_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Communications_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_communications_body(inputs)
	return es_demo_narrative_admin_communications_body(inputs)
});