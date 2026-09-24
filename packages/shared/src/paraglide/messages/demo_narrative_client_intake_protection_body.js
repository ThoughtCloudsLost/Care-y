/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Protection_BodyInputs */

const en_demo_narrative_client_intake_protection_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Protection_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The intake form encrypts every value the visitor types before it leaves the browser, the server cannot read the answers at any point, and nobody outside the organization can. A fresh submission is sealed so that anyone in the organization can open it, because the visitor has no relationship to any specific person yet, and once someone picks the case up the access narrows to the people working it.
**Why it matters.** The visitor sees this explanation before entering any information, and a person filling out a form for a sensitive service needs to know whether typing into this page is safe before they start.`)
};

const es_demo_narrative_client_intake_protection_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Protection_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El formulario de admisión cifra cada valor que escribe el visitante antes de que salga del navegador, el servidor no puede leer las respuestas en ningún momento y nadie fuera de la organización puede hacerlo. Un envío nuevo se sella de modo que cualquier persona dentro de la organización pueda abrirlo, porque el visitante aún no tiene relación con ninguna persona específica, y una vez que alguien toma el caso el acceso se restringe a las personas que lo trabajan.
**Por qué importa.** El visitante ve esta explicación antes de ingresar cualquier información, y una persona que llena un formulario para un servicio sensible necesita saber si escribir en esta página es seguro antes de comenzar.`)
};

const en_xa2_demo_narrative_client_intake_protection_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Protection_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ìntàkè fòrm èncrypts èvèry vàlùè thè vìsìtòr typès bèfòrè ìt lèàvès thè bròwsèr, thè sèrvèr cànnòt rèàd thè ànswèrs àt àny pòìnt, ànd nòbòdy òùtsìdè thè òrgànìzàtìòn càn. À frèsh sùbmìssìòn ìs sèàlèd sò thàt ànyònè ìn thè òrgànìzàtìòn càn òpèn ìt, bècàùsè thè vìsìtòr hàs nò rèlàtìònshìp tò àny spècìfìc pèrsòn yèt, ànd òncè sòmèònè pìcks thè càsè ùp thè àccèss nàrròws tò thè pèòplè wòrkìng ìt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why ìt màttèrs. •••••** Thè vìsìtòr sèès thìs èxplànàtìòn bèfòrè èntèrìng àny ìnfòrmàtìòn, ànd à pèrsòn fìllìng òùt à fòrm fòr à sènsìtìvè sèrvìcè nèèds tò knòw whèthèr typìng ìntò thìs pàgè ìs sàfè bèfòrè thèy stàrt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The intake form encrypts every value the visitor types before it leaves the browser, the server cannot read the answers at any point, and nobody outside the ..." |
*
* @param {Demo_Narrative_Client_Intake_Protection_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_protection_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Protection_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Protection_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_protection_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_intake_protection_body(inputs)
	return en_demo_narrative_client_intake_protection_body(inputs)
});