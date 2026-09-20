/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Fold_BodyInputs */

const en_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case fields below the header can be folded away. The title, status, and priority stay visible in the header above.
**Encryption.** The description is encrypted with the per ticket key, and the queue and assignee names with the organization key. The opened date is plaintext metadata the server uses for sorting.
**The full record.** The complete field list, along with the role masked client phone number and the case actions, lives in the case panel.`)
};

const es_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los campos del caso bajo el encabezado pueden plegarse. El título, el estado y la prioridad permanecen visibles en el encabezado de arriba.
**Cifrado.** La descripción está cifrada con la clave por ticket, y los nombres de la cola y del asignado con la clave de la organización. La fecha de apertura es un metadato en texto plano que el servidor usa para ordenar.
**El registro completo.** La lista completa de campos, junto con el número de teléfono del cliente enmascarado por rol y las acciones del caso, vive en el panel del caso.`)
};

const en_xa2_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè càsè fìèlds bèlòw thè hèàdèr càn bè fòldèd àwày. Thè tìtlè, stàtùs, ànd prìòrìty stày vìsìblè ìn thè hèàdèr àbòvè.
 ••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Thè dèscrìptìòn ìs èncryptèd wìth thè pèr tìckèt kèy, ànd thè qùèùè ànd àssìgnèè nàmès wìth thè òrgànìzàtìòn kèy. Thè òpènèd dàtè ìs plàìntèxt mètàdàtà thè sèrvèr ùsès fòr sòrtìng.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fùll rècòrd. •••••** Thè còmplètè fìèld lìst, àlòng wìth thè ròlè màskèd clìènt phònè nùmbèr ànd thè càsè àctìòns, lìvès ìn thè càsè pànèl. ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The case fields below the header can be folded away. The title, status, and priority stay visible in the header above. **Encryption.** The description is enc..." |
*
* @param {Demo_Narrative_Topic_Case_Fold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_fold_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Fold_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Fold_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_case_fold_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_case_fold_body(inputs)
	return en_demo_narrative_topic_case_fold_body(inputs)
});