/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Quarantine_BodyInputs */

const en_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemails from unknown callers wait here for review. The audio is encrypted to the organization's public key before storage, so the server never has access to the recording.
**Playback.** Decrypts the audio in the browser. The server delivers the sealed ciphertext and the volunteer's browser unseals it with the organization's private key.
**Routing.** Administrators can route a voicemail to a new or existing ticket, or dismiss it. The caller and called numbers are also sealed before storage.
**Why a voicemail lands here.** Each entry shows its reason. Either no intake queue was configured to receive the call, the caller could not be matched to a client, or no tracked call existed to route the recording to.`)
};

const es_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los correos de voz de llamantes desconocidos esperan aquí para revisión. El audio se cifra con la clave pública de la organización antes de almacenarse, por lo que el servidor nunca tiene acceso a la grabación.
**Reproducción.** Descifra el audio en el navegador. El servidor entrega el texto cifrado sellado y el navegador del voluntario lo desbloquea con la clave privada de la organización.
**Enrutamiento.** Los administradores pueden enrutar un correo de voz a un ticket nuevo o existente, o descartarlo. Los números del llamante y de la línea llamada también se sellan antes de almacenarse.
**Por qué un correo de voz llega aquí.** Cada entrada muestra su motivo. O no se configuró una cola de recepción para recibir la llamada, el llamante no pudo ser asociado a un cliente, o no existía una llamada rastreada a la cual enrutar la grabación.`)
};

/**
* | output |
* | --- |
* | "Voicemails from unknown callers wait here for review. The audio is encrypted to the organization's public key before storage, so the server never has access ..." |
*
* @param {Demo_Narrative_Admin_Quarantine_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_quarantine_body = /** @type {((inputs?: Demo_Narrative_Admin_Quarantine_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Quarantine_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_quarantine_body(inputs)
	return en_demo_narrative_admin_quarantine_body(inputs)
});