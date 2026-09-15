/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Portal_Composer_BodyInputs */

const en_demo_narrative_client_portal_composer_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Composer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The portal reply composer encrypts each message in the browser before sending the ciphertext to the server, with a limit of 5000 characters and a counter that appears at 4500.
**If it fails.** If a send fails the composer restores the message text so the client can retry without retyping.
**Encryption.** Each reply is encrypted twice so both sides can read it. A copy sealed to the portal channel key lets the client decrypt it on future visits, and a content key sealed to the organization's public key lets any user with the organization key decrypt it. That organization key copy is consumed and deleted the first time a user opens the message, after which only users who hold per ticket key wraps can read it.
**Persistence.** Unsent text in the compose bar survives navigation within the session but never outlives the tab, so closing the browser leaves no draft on the device.`)
};

const es_demo_narrative_client_portal_composer_body = /** @type {(inputs: Demo_Narrative_Client_Portal_Composer_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El compositor de respuesta del portal cifra cada mensaje en el navegador antes de enviar el texto cifrado al servidor, con un límite de 5000 caracteres y un contador que aparece a partir de 4500.
**Si falla.** Si un envío falla el compositor restaura el texto del mensaje para que el cliente pueda reintentar sin volver a escribir.
**Cifrado.** Cada respuesta se cifra dos veces para que ambas partes puedan leerla. Una copia sellada con la clave del canal del portal permite al cliente descifrarla en futuras visitas, y una clave de contenido sellada con la clave pública de la organización permite que la persona usuaria que tenga la clave de la organización la descifre. Esa copia de la clave de organización se consume y se elimina la primera vez que la persona usuaria abre el mensaje, tras lo cual solo quienes posean envolvimientos de la clave del caso pueden leerlo.
**Persistencia.** El texto no enviado en la barra de redacción sobrevive a la navegación dentro de la sesión pero nunca persiste más allá de la pestaña, de modo que cerrar el navegador no deja ningún borrador en el dispositivo.`)
};

/**
* | output |
* | --- |
* | "The portal reply composer encrypts each message in the browser before sending the ciphertext to the server, with a limit of 5000 characters and a counter tha..." |
*
* @param {Demo_Narrative_Client_Portal_Composer_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_composer_body = /** @type {((inputs?: Demo_Narrative_Client_Portal_Composer_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Portal_Composer_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_portal_composer_body(inputs)
	return en_demo_narrative_client_portal_composer_body(inputs)
});