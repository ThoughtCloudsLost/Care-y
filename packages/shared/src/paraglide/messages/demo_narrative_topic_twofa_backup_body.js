/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Backup_BodyInputs */

const en_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`At first enrollment of any second-factor method, the system generates eight one-time backup codes. Each code works exactly once.
**What the server holds.** The server stores only hashes of these codes. They are displayed once at generation and cannot be retrieved afterward. Regeneration deletes the previous set immediately.
**Fallback.** Backup codes should be stored outside the system, and not on the same device used to sign in. They exist for the scenario where the usual method is unavailable.`)
};

const es_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al inscribir el primer método de segundo factor, el sistema genera ocho códigos de respaldo de un solo uso. Cada código funciona exactamente una vez.
**Lo que almacena el servidor.** El servidor almacena solo los hashes de estos códigos. Se muestran una sola vez en el momento de la generación y no se pueden recuperar después. La regeneración elimina el conjunto anterior de inmediato.
**Alternativa.** Los códigos de respaldo deben almacenarse fuera del sistema, y no en el mismo dispositivo utilizado para iniciar sesión. Existen para el caso en que el método habitual no esté disponible.`)
};

const en_xa2_demo_narrative_topic_twofa_backup_body = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Backup_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àt fìrst ènròllmènt òf àny sècònd-fàctòr mèthòd, thè systèm gènèràtès èìght ònè-tìmè bàckùp còdès. Èàch còdè wòrks èxàctly òncè.
 •••••••••••••••••••••••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Thè sèrvèr stòrès ònly hàshès òf thèsè còdès. Thèy àrè dìsplàyèd òncè àt gènèràtìòn ànd cànnòt bè rètrìèvèd àftèrwàrd. Règènèràtìòn dèlètès thè prèvìòùs sèt ìmmèdìàtèly.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••**Fàllbàck. •••** Bàckùp còdès shòùld bè stòrèd òùtsìdè thè systèm, ànd nòt òn thè sàmè dèvìcè ùsèd tò sìgn ìn. Thèy èxìst fòr thè scènàrìò whèrè thè ùsùàl mèthòd ìs ùnàvàìlàblè. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "At first enrollment of any second-factor method, the system generates eight one-time backup codes. Each code works exactly once. **What the server holds.** T..." |
*
* @param {Demo_Narrative_Topic_Twofa_Backup_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_backup_body = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Backup_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Backup_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_backup_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_backup_body(inputs)
	return en_demo_narrative_topic_twofa_backup_body(inputs)
});