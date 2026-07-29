/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Admin_Quarantine_BodyInputs */

const en_demo_narrative_topic_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Topic_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemails from unknown callers wait here for review. The audio is sealed to the organization key before storage, so the server never hears the recording. Playback decrypts the audio in the browser. Administrators can route a voicemail to a new or existing ticket, or dismiss it.`)
};

const es_demo_narrative_topic_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Topic_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los correos de voz de llamantes desconocidos esperan aqui para revision. El audio se sella con la clave de la organizacion antes del almacenamiento, por lo que el servidor nunca escucha la grabacion. La reproduccion descifra el audio en el navegador. Los administradores pueden enrutar un correo de voz a un ticket nuevo o existente, o descartarlo.`)
};

/**
* | output |
* | --- |
* | "Voicemails from unknown callers wait here for review. The audio is sealed to the organization key before storage, so the server never hears the recording. Pl..." |
*
* @param {Demo_Narrative_Topic_Admin_Quarantine_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_admin_quarantine_body = /** @type {((inputs?: Demo_Narrative_Topic_Admin_Quarantine_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Admin_Quarantine_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_admin_quarantine_body(inputs)
	return es_demo_narrative_topic_admin_quarantine_body(inputs)
});