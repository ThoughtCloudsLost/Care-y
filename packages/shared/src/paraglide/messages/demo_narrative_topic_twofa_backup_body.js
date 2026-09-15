/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_BodyInputs */

const en_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Backup codes are a set of eight one time codes, generated as soon as the first second factor method is enrolled and kept by the user outside the system, and each code is accepted once and then spent.
**Fallback.** A backup code stands in whenever no other enrolled method can be used, whatever has made the others unavailable.
**One time reveal.** Backup codes are shown once, at the moment they are generated, and the server keeps only hashes of them, so no screen can show them again and a set that has been lost cannot be recovered.
**Where to keep them.** Backup codes are meant for paper or a password manager, and keeping them on the device used to sign in defeats the point, since losing that device would take the primary method and the fallback together.
**Regeneration.** Generating a new set of backup codes deletes every code in the old set in the same step, so a sheet printed earlier stops working the moment the new codes appear.`)
};

const es_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los códigos de respaldo son un juego de ocho códigos de un solo uso, generados en cuanto se registra el primer método de segundo factor y guardados por la persona usuaria fuera del sistema, y cada código se acepta una vez y queda gastado.
**Alternativa.** Un código de respaldo sirve siempre que no pueda usarse ningún otro método registrado, cualquiera que sea la razón por la que los demás no están disponibles.
**Revelación única.** Los códigos de respaldo se muestran una sola vez, en el momento en que se generan, y el servidor guarda solo hashes de ellos, así que ninguna pantalla puede volver a mostrarlos y un juego perdido no puede recuperarse.
**Dónde guardarlos.** Los códigos de respaldo están pensados para el papel o para un gestor de contraseñas, y guardarlos en el mismo dispositivo con el que se inicia sesión desvirtúa su propósito, ya que perder ese dispositivo se llevaría a la vez el método principal y la alternativa.
**Regeneración.** Generar un juego nuevo de códigos de respaldo elimina en el mismo paso todos los códigos del juego anterior, de modo que una hoja impresa antes deja de funcionar en cuanto aparecen los códigos nuevos.`)
};

/**
* | output |
* | --- |
* | "Backup codes are a set of eight one time codes, generated as soon as the first second factor method is enrolled and kept by the user outside the system, and ..." |
*
* @param {Demo_Narrative_Topic_Twofa_Backup_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_backup_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Backup_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Backup_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_backup_body(inputs)
	return en_demo_narrative_topic_twofa_backup_body(inputs)
});