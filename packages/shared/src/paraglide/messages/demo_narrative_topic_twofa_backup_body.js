/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_BodyInputs */

const en_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Backup codes are generated once at enrollment and stored by you, outside the system. Each code works exactly once. They are the recovery path for when no other method is available.`)
};

const es_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los codigos de respaldo se generan una vez durante el registro y los guardas tu, fuera del sistema. Cada codigo funciona exactamente una vez. Son la via de recuperacion cuando ningun otro metodo esta disponible.`)
};

/**
* | output |
* | --- |
* | "Backup codes are generated once at enrollment and stored by you, outside the system. Each code works exactly once. They are the recovery path for when no oth..." |
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