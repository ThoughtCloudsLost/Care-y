/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_BodyInputs */

const en_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Backup codes are eight one time codes, generated as soon as the first method for the second factor is enrolled and kept by the user outside the system. Each code is accepted once and then spent, and they stand in whenever no other enrolled method can be used, whatever has made the others unavailable.
**What the server holds.** The server keeps only hashes of the codes, never the codes themselves.
**Persistence.** The codes are shown once, at generation, and no screen can show them again. A lost set cannot be recovered. They are meant for paper or a password manager, and keeping them on the device used to sign in defeats the point since losing that device would take the primary method and the fallback together.
**Regenerating.** Regenerating deletes every code in the old set in the same step, so a sheet printed earlier stops working the moment the new codes appear.`)
};

const es_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los códigos de respaldo son ocho códigos de un solo uso, generados en cuanto se registra el primer método para el segundo factor y conservados fuera del sistema por la persona usuaria. Cada código se acepta una vez y queda gastado, y sirven como sustituto cuando ningún otro método registrado puede usarse, sea cual sea la razón.
**Lo que almacena el servidor.** El servidor solo guarda los hashes de los códigos, nunca los códigos en sí.
**Persistencia.** Los códigos se muestran una sola vez, al generarse, y ninguna pantalla puede volver a mostrarlos. Un conjunto perdido no puede recuperarse. Están pensados para papel o un gestor de contraseñas, y guardarlos en el mismo dispositivo con el que se inicia sesión anula su propósito, ya que perder ese dispositivo llevaría consigo tanto el método principal como el de respaldo.
**Regeneración.** Regenerar elimina todos los códigos del conjunto anterior en el mismo paso, de modo que una hoja impresa anteriormente deja de funcionar en el momento en que aparecen los nuevos códigos.`)
};

/**
* | output |
* | --- |
* | "Backup codes are eight one time codes, generated as soon as the first method for the second factor is enrolled and kept by the user outside the system. Each ..." |
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