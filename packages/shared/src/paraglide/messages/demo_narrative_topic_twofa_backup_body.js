/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_BodyInputs */

const en_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When you enroll your first second-factor method, the system generates eight one-time backup codes. Each code works exactly once.
**What the server holds.** The server stores only hashes of these codes. They are displayed once at generation and cannot be retrieved afterward. If you regenerate your codes, the previous set is deleted immediately.
**Fallback.** Store your backup codes outside the system, and not on the same device you sign in with. They exist for the scenario where your usual method is unavailable.`)
};

const es_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al inscribir el primer método de segundo factor, el sistema genera ocho códigos de respaldo de un solo uso. Cada código funciona exactamente una vez.
**Lo que almacena el servidor.** El servidor almacena solo los hashes de estos códigos. Se muestran una sola vez en el momento de la generación y no se pueden recuperar después. Si se regeneran los códigos, el conjunto anterior se elimina de inmediato.
**Alternativa.** Guarde los códigos de respaldo fuera del sistema, y no en el mismo dispositivo con el que inicia sesión. Existen para el caso en que su método habitual no esté disponible.`)
};

/**
* | output |
* | --- |
* | "When you enroll your first second-factor method, the system generates eight one-time backup codes. Each code works exactly once. **What the server holds.** T..." |
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