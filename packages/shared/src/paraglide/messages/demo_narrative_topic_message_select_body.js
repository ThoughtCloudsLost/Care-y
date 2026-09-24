/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Message_Select_BodyInputs */

const en_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selection mode allows picking messages from the thread individually or all at once.
**Copy.** The selection bar copies the decrypted text of every selected message to the clipboard in one action.
**Privacy.** Selection state and the copied text stay on the device. The server does not know which messages were selected.`)
};

const es_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El modo de selección permite elegir mensajes del hilo individualmente o todos a la vez.
**Copiar.** La barra de selección copia el texto descifrado de todos los mensajes seleccionados al portapapeles en una sola acción.
**Privacidad.** El estado de selección y el texto copiado permanecen en el dispositivo. El servidor no sabe cuáles mensajes fueron seleccionados.`)
};

const en_xa2_demo_narrative_topic_message_select_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Select_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèctìòn mòdè àllòws pìckìng mèssàgès fròm thè thrèàd ìndìvìdùàlly òr àll àt òncè.
 ••••••••••••••••••••••••••**Còpy. ••** Thè sèlèctìòn bàr còpìès thè dècryptèd tèxt òf èvèry sèlèctèd mèssàgè tò thè clìpbòàrd ìn ònè àctìòn.
 •••••••••••••••••••••••••••••••**Prìvàcy. •••** Sèlèctìòn stàtè ànd thè còpìèd tèxt stày òn thè dèvìcè. Thè sèrvèr dòès nòt knòw whìch mèssàgès wèrè sèlèctèd. ••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Selection mode allows picking messages from the thread individually or all at once. **Copy.** The selection bar copies the decrypted text of every selected m..." |
*
* @param {Demo_Narrative_Topic_Message_Select_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_select_body = /** @type {((inputs?: Demo_Narrative_Topic_Message_Select_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Message_Select_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_message_select_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_message_select_body(inputs)
	return en_demo_narrative_topic_message_select_body(inputs)
});