/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Quarantine_BodyInputs */

const en_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemails from unknown callers wait here for review. The audio is sealed to the organization's public key before storage using crypto_box_seal, so the server never has access to the recording.
**Playback.** Decrypts the audio in the browser. The server delivers the sealed ciphertext and the volunteer's browser unseals it with the organization key.
**Routing.** Administrators can route a voicemail to a new or existing ticket, or dismiss it. The caller and called numbers are also sealed before storage.
**Why a voicemail lands here.** Each entry shows its reason. Either no intake queue was configured to receive the call, or the caller could not be matched to a client, or the match was ambiguous.`)
};

const es_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los correos de voz de llamantes desconocidos esperan aqui para revision. El audio se sella con la clave publica de la organizacion antes de almacenarse usando crypto_box_seal, por lo que el servidor nunca tiene acceso a la grabacion.
**Reproduccion.** Descifra el audio en el navegador. El servidor entrega el texto cifrado sellado y el navegador del voluntario lo desbloquea con la clave de la organizacion.
**Enrutamiento.** Los administradores pueden enrutar un correo de voz a un ticket nuevo o existente, o descartarlo. Los numeros del llamante y de la linea llamada tambien se sellan antes de almacenarse.
**Por que un correo de voz llega aqui.** Cada entrada muestra su motivo. O no se configuro una cola de recepcion para recibir la llamada, o el llamante no pudo ser asociado a un cliente, o la coincidencia fue ambigua.`)
};

/**
* | output |
* | --- |
* | "Voicemails from unknown callers wait here for review. The audio is sealed to the organization's public key before storage using crypto_box_seal, so the serve..." |
*
* @param {Demo_Narrative_Admin_Quarantine_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_quarantine_body = /** @type {((inputs?: Demo_Narrative_Admin_Quarantine_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Quarantine_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_quarantine_body(inputs)
	return es_demo_narrative_admin_quarantine_body(inputs)
});