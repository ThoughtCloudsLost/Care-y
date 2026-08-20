/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_BodyInputs */

const en_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A set of one time codes generated during enrollment and stored by the volunteer outside the system. Each code works exactly once.
**When to use them.** Backup codes are the last resort when no other second factor method is available, such as a lost phone, a new device, or a broken authenticator app.
**Storage.** Volunteers should write these codes down or store them in a password manager. They should not be stored on the same device used for login, since losing that device would mean losing both the primary method and the backup.
**Regeneration.** New backup codes can be generated from the Settings page, which invalidates all previously issued codes.`)
};

const es_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un conjunto de códigos de un solo uso generados durante el registro y almacenados por el voluntario fuera del sistema. Cada código funciona exactamente una vez.
**Cuándo usarlos.** Los códigos de respaldo son el último recurso cuando ningún otro método de segundo factor está disponible, como un teléfono perdido, un dispositivo nuevo o una aplicación de autenticación rota.
**Almacenamiento.** Los voluntarios deben anotar estos códigos o guardarlos en un gestor de contraseñas. No deben almacenarse en el mismo dispositivo usado para iniciar sesión, ya que perder ese dispositivo significaría perder tanto el método principal como el respaldo.
**Regeneración.** Se pueden generar nuevos códigos de respaldo desde la página de Configuración, lo que invalida todos los códigos emitidos anteriormente.`)
};

/**
* | output |
* | --- |
* | "A set of one time codes generated during enrollment and stored by the volunteer outside the system. Each code works exactly once. **When to use them.** Backu..." |
*
* @param {Demo_Narrative_Topic_Twofa_Backup_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_backup_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Backup_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Backup_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_backup_body(inputs)
	return es_demo_narrative_topic_twofa_backup_body(inputs)
});