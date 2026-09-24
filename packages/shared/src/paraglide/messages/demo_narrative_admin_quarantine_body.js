/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Quarantine_BodyInputs */

const en_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemails from unknown callers land in the quarantine and wait for review.
**Encryption.** Quarantine audio is sealed to the organization's public key before storage so the server cannot access the recording, and the caller and called numbers are sealed the same way.
**Playback.** Quarantine audio reaches the browser as sealed ciphertext, and the user's browser unseals it with the organization's private key so decryption happens locally.
**Routing.** A quarantined voicemail can be routed to a new or existing ticket, or dismissed.
**Quarantine reasons.** A voicemail reaches the quarantine when no intake queue was configured to receive the call, when the caller could not be matched to a client, or when no tracked call existed to route the recording to.
**Permissions.** Reviewing and routing quarantined voicemails requires the Manage voicemail quarantine permission.`)
};

const es_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los mensajes de voz de llamantes desconocidos llegan a la cuarentena y esperan revisión.
**Cifrado.** El audio en cuarentena se sella con la clave pública de la organización antes de almacenarse para que el servidor no pueda acceder a la grabación, y los números del llamante y de la línea llamada se sellan de la misma forma.
**Reproducción.** El audio en cuarentena llega al navegador como texto cifrado sellado, y el navegador de la persona usuaria lo abre con la clave privada de la organización para que el descifrado ocurra localmente.
**Enrutamiento.** Un mensaje de voz en cuarentena puede enrutarse a un ticket nuevo o existente, o descartarse.
**Motivos de cuarentena.** Un mensaje de voz llega a la cuarentena cuando no se configuró una cola de recepción para recibir la llamada, cuando el llamante no pudo ser asociado a un cliente, o cuando no existía una llamada rastreada a la cual enrutar la grabación.
**Permisos.** Revisar y enrutar mensajes de voz en cuarentena requiere el permiso Gestionar cuarentena de correos de voz.`)
};

const en_xa2_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìls fròm ùnknòwn càllèrs lànd ìn thè qùàràntìnè ànd wàìt fòr rèvìèw.
 •••••••••••••••••••••••**Èncryptìòn. ••••** Qùàràntìnè àùdìò ìs sèàlèd tò thè òrgànìzàtìòn's pùblìc kèy bèfòrè stòràgè sò thè sèrvèr cànnòt àccèss thè rècòrdìng, ànd thè càllèr ànd càllèd nùmbèrs àrè sèàlèd thè sàmè wày.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Plàybàck. •••** Qùàràntìnè àùdìò rèàchès thè bròwsèr às sèàlèd cìphèrtèxt, ànd thè ùsèr's bròwsèr ùnsèàls ìt wìth thè òrgànìzàtìòn's prìvàtè kèy sò dècryptìòn hàppèns lòcàlly.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Ròùtìng. •••** À qùàràntìnèd vòìcèmàìl càn bè ròùtèd tò à nèw òr èxìstìng tìckèt, òr dìsmìssèd.
 •••••••••••••••••••••••••**Qùàràntìnè rèàsòns. ••••••** À vòìcèmàìl rèàchès thè qùàràntìnè whèn nò ìntàkè qùèùè wàs cònfìgùrèd tò rècèìvè thè càll, whèn thè càllèr còùld nòt bè màtchèd tò à clìènt, òr whèn nò tràckèd càll èxìstèd tò ròùtè thè rècòrdìng tò.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Rèvìèwìng ànd ròùtìng qùàràntìnèd vòìcèmàìls rèqùìrès thè Mànàgè vòìcèmàìl qùàràntìnè pèrmìssìòn. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Voicemails from unknown callers land in the quarantine and wait for review. **Encryption.** Quarantine audio is sealed to the organization's public key befor..." |
*
* @param {Demo_Narrative_Admin_Quarantine_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_quarantine_body = /** @type {((inputs?: Demo_Narrative_Admin_Quarantine_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Quarantine_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_quarantine_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_quarantine_body(inputs)
	return en_demo_narrative_admin_quarantine_body(inputs)
});